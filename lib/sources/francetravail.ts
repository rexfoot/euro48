import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex } from "../city-index";
import { OFFER_VISIBLE_HOURS } from "../constants";
import type { NewOffer } from "../offers";

// OAuth2 client_credentials against France Travail's identity provider (a
// separate host from the API itself) — this source is the only one of our
// 7 that needs a token, so it caches it in memory between calls instead of
// asking for a fresh one every run.
const TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const SCOPE = "api_offresdemploiv2 o2dsoffre";
const RESULTS_PER_CALL = Number(process.env.FRANCE_TRAVAIL_RESULTS_PER_CALL ?? 150); // documented per-request max
const FETCH_TIMEOUT_MS = 15_000;

type FtToken = { accessToken: string; expiresAt: number };
let cachedToken: FtToken | null = null;

async function getToken(): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) return cachedToken.accessToken;

  const clientId = process.env.FRANCE_TRAVAIL_CLIENT_ID;
  const clientSecret = process.env.FRANCE_TRAVAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: SCOPE,
  });

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[francetravail] token HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cachedToken.accessToken;
  } catch (err) {
    console.error(`[francetravail] token fetch threw — ${(err as Error).message}`);
    return null;
  }
}

type FtOffer = {
  id: string;
  intitule: string;
  entreprise?: { nom?: string };
  lieuTravail?: { libelle?: string };
  typeContrat?: string;
  typeContratLibelle?: string;
  dateCreation?: string;
  origineOffre?: { urlOrigine?: string };
  salaire?: { libelle?: string };
};

type FtSearchResult = { resultats?: FtOffer[] };

// Real format (verified live against 150 offers, 2026-09-27): "33 -
// Arcachon", "972 - LE MORNE ROUGE", "2A - Ajaccio" — a 2-3 digit (or
// Corsica's 2A/2B) département code, NOT a 4-5 digit postal code as
// originally assumed, which meant this never stripped and every city
// lookup failed. Paris/Marseille (only cities split into arrondissements)
// also need their numbered-district suffix stripped: "75 - Paris 12e
// Arrondissement" -> "Paris", "13 - MARSEILLE 02" -> "MARSEILLE".
const DEPT_PREFIX = /^(2[AB]|\d{2,3})\s*-\s*/i;
const ARRONDISSEMENT_SUFFIX = /\s+\d{1,2}(er|e|ème|eme)?(\s*arrondissement)?$/i;

function cleanLibelle(libelle: string): string {
  return libelle.replace(DEPT_PREFIX, "").replace(ARRONDISSEMENT_SUFFIX, "").trim();
}

function isoNoMillis(d: Date): string {
  return d.toISOString().replace(/\.\d+Z$/, "Z");
}

export async function fetchFranceTravailOffers(): Promise<NewOffer[]> {
  const token = await getToken();
  if (!token) return [];

  const now = new Date();
  const since = new Date(now.getTime() - OFFER_VISIBLE_HOURS * 3_600_000);

  const url = new URL(SEARCH_URL);
  url.searchParams.set("minCreationDate", isoNoMillis(since));
  url.searchParams.set("maxCreationDate", isoNoMillis(now));
  url.searchParams.set("range", `0-${RESULTS_PER_CALL - 1}`);
  url.searchParams.set("sort", "1"); // most recent first

  let data: FtSearchResult;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    // This API answers a normal successful page with 206 (partial content),
    // not just 200 — both mean "here are some results", not an error.
    if (res.status !== 200 && res.status !== 206) {
      console.error(`[francetravail] search HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
      return [];
    }
    data = (await res.json()) as FtSearchResult;
  } catch (err) {
    console.error(`[francetravail] search fetch threw — ${(err as Error).message}`);
    return [];
  }

  const jobs = data.resultats ?? [];
  const cityIndex = await getCityIndex();

  return jobs.map((job): NewOffer => {
    const rawLibelle = job.lieuTravail?.libelle ?? "";
    const { city, lat, lng } = resolveCity(cityIndex, rawLibelle ? [cleanLibelle(rawLibelle)] : [], "FR");
    const specialty = matchSpecialty(job.intitule);

    return {
      id: `francetravail:${job.id}`,
      titleOriginal: job.intitule,
      titleEn: job.intitule,
      titleFr: job.intitule,
      titleEs: job.intitule,
      company: job.entreprise?.nom || "—",
      countryCode: "FR",
      city,
      cityLat: lat,
      cityLng: lng,
      specialty,
      contractType: job.typeContratLibelle ?? job.typeContrat ?? null,
      salaryRaw: job.salaire?.libelle ?? null,
      remote: /t[ée]l[ée]travail|remote/i.test(job.intitule),
      languageOfAd: "fr",
      url:
        job.origineOffre?.urlOrigine ||
        `https://candidat.francetravail.fr/offres/recherche/detail/${encodeURIComponent(job.id)}`,
      source: "francetravail",
      publishedAt: job.dateCreation ? new Date(job.dateCreation) : new Date(),
    };
  });
}
