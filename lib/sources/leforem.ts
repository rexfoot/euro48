import { OFFER_VISIBLE_HOURS } from "../constants";
import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import { getCursor, setCursor } from "../worker-state";
import type { NewOffer } from "../offers";

// Le Forem (Wallonia's public employment service) publishes its job offers
// as genuinely open data on ODWB (Open Data Wallonie-Bruxelles) — free,
// keyless, ~10k requests/day, no registration. It also carries offers
// relayed from other Belgian boards (Jobat, Accent Job...) and, in French
// translation, from VDAB (Flanders) — see leforem.be/open-data.html.
const BASE_URL = "https://www.odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records";
const PAGE_SIZE = 100; // API max
const PAGES_PER_RUN = Number(process.env.LEFOREM_PAGES_PER_RUN ?? 5);
const FETCH_TIMEOUT_MS = 15_000;

type LeforemRecord = {
  numerooffreforem: string;
  titreoffre: string;
  lieuxtravaillocalite?: string[] | null;
  typecontrat?: string | null;
  nomemployeur?: string | null;
  url: string;
  datedebutdiffusion: string; // date only, e.g. "2026-09-27" — no time of day
};

type LeforemResponse = { total_count?: number; results?: LeforemRecord[] };

async function fetchPage(offset: number, sinceDate: string): Promise<{ results: LeforemRecord[]; totalCount: number }> {
  const url = new URL(BASE_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("order_by", "datedebutdiffusion desc");
  url.searchParams.set("where", `datedebutdiffusion >= date'${sinceDate}'`);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) {
      console.error(`[leforem] HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
      return { results: [], totalCount: 0 };
    }
    const data = (await res.json()) as LeforemResponse;
    return { results: data.results ?? [], totalCount: data.total_count ?? 0 };
  } catch (err) {
    console.error(`[leforem] fetch threw — ${(err as Error).message}`);
    return { results: [], totalCount: 0 };
  }
}

function build(job: LeforemRecord, cityIndex: CityIndex): NewOffer {
  const { city, lat, lng } = resolveCity(cityIndex, job.lieuxtravaillocalite ?? [], "BE");
  const specialty = matchSpecialty(job.titreoffre);

  return {
    id: `leforem:${job.numerooffreforem}`,
    titleOriginal: job.titreoffre,
    titleEn: job.titreoffre,
    titleFr: job.titreoffre,
    titleEs: job.titreoffre,
    company: job.nomemployeur || "—",
    countryCode: "BE",
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: job.typecontrat ?? null,
    salaryRaw: null,
    remote: /t[ée]l[ée]travail|remote|thuiswerk/i.test(job.titreoffre),
    languageOfAd: "fr",
    url: job.url,
    source: "leforem",
    // datedebutdiffusion has no time of day — treated as start-of-day UTC,
    // same coarseness the 48h visibility window then applies to.
    publishedAt: new Date(`${job.datedebutdiffusion}T00:00:00Z`),
  };
}

// 2026-09-27: this used to always start at offset 0, so every 12-min run
// re-fetched the exact same top ~500 (order_by is a stable sort on a
// date-only field, so "today" doesn't reshuffle within the day) — leaving
// most of a 2000+/48h dataset never actually fetched. Now rotates through
// the full result set across runs via a DB cursor, the same pattern EURES
// and Adzuna already use for their own per-run limits.
export async function fetchLeforemOffers(): Promise<NewOffer[]> {
  const since = new Date(Date.now() - OFFER_VISIBLE_HOURS * 3_600_000);
  const sinceDate = since.toISOString().slice(0, 10);

  const cursor = await getCursor<{ offset?: number }>("leforem");
  let offset = cursor.offset ?? 0;

  const cityIndex = await getCityIndex();
  const jobs: LeforemRecord[] = [];
  let totalCount = 0;
  let reachedEnd = false;

  for (let i = 0; i < PAGES_PER_RUN; i++) {
    const page = await fetchPage(offset, sinceDate);
    totalCount = page.totalCount;
    jobs.push(...page.results);
    offset += PAGE_SIZE;
    if (page.results.length < PAGE_SIZE) {
      reachedEnd = true;
      break;
    }
  }

  const nextOffset = reachedEnd || (totalCount > 0 && offset >= totalCount) ? 0 : offset;
  await setCursor("leforem", { offset: nextOffset });

  return jobs.map((job) => build(job, cityIndex));
}
