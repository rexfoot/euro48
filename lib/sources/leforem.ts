import { OFFER_VISIBLE_HOURS } from "../constants";
import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
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

type LeforemResponse = { results?: LeforemRecord[] };

async function fetchPage(offset: number, sinceDate: string): Promise<LeforemRecord[]> {
  const url = new URL(BASE_URL);
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("order_by", "datedebutdiffusion desc");
  url.searchParams.set("where", `datedebutdiffusion >= date'${sinceDate}'`);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) {
      console.error(`[leforem] HTTP ${res.status} — ${(await res.text()).slice(0, 300)}`);
      return [];
    }
    const data = (await res.json()) as LeforemResponse;
    return data.results ?? [];
  } catch (err) {
    console.error(`[leforem] fetch threw — ${(err as Error).message}`);
    return [];
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

export async function fetchLeforemOffers(): Promise<NewOffer[]> {
  const since = new Date(Date.now() - OFFER_VISIBLE_HOURS * 3_600_000);
  const sinceDate = since.toISOString().slice(0, 10);

  const cityIndex = await getCityIndex();
  const jobs: LeforemRecord[] = [];
  for (let i = 0; i < PAGES_PER_RUN; i++) {
    const page = await fetchPage(i * PAGE_SIZE, sinceDate);
    jobs.push(...page);
    if (page.length < PAGE_SIZE) break; // last page reached
  }

  return jobs.map((job) => build(job, cityIndex));
}
