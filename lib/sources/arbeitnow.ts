import { LANGUAGE_BY_COUNTRY } from "../constants";
import { resolveCityWithCountry, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import { mapWithConcurrency } from "../concurrency";
import type { NewOffer } from "../offers";

const BASE_URL = "https://www.arbeitnow.com/api/job-board-api";
const FETCH_TIMEOUT_MS = 20_000;
const PAGES_PER_RUN = Number(process.env.ARBEITNOW_PAGES_PER_RUN ?? 3);
const PAGE_CONCURRENCY = 2;

type ArbeitnowJob = {
  slug: string;
  company_name: string;
  title: string;
  location: string;
  url: string;
  remote: boolean;
  job_types?: string[];
  created_at: number; // unix seconds
};

type ArbeitnowResponse = {
  data?: ArbeitnowJob[];
};

async function fetchPage(page: number): Promise<ArbeitnowJob[]> {
  try {
    const res = await fetch(`${BASE_URL}?page=${page}`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.status === 429) return [];
    if (!res.ok) return [];
    const data = (await res.json()) as ArbeitnowResponse;
    return data.data ?? [];
  } catch {
    return [];
  }
}

function build(job: ArbeitnowJob, cityIndex: CityIndex): NewOffer | null {
  const parts = job.location.split(",").map((p) => p.trim()).filter(Boolean);
  const match = resolveCityWithCountry(cityIndex, parts);
  if (!match) return null; // no known city and no country mentioned — can't place it in any of our 15
  const { city, country, lat, lng } = match;

  const specialty = matchSpecialty(job.title);
  if (!specialty) return null;

  return {
    id: `arbeitnow:${job.slug}`,
    titleOriginal: job.title,
    titleEn: job.title,
    titleFr: job.title,
    titleEs: job.title,
    company: job.company_name || "—",
    countryCode: country,
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: job.job_types?.length ? job.job_types.join(", ") : null,
    salaryRaw: null,
    remote: job.remote,
    languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
    url: job.url,
    source: "arbeitnow",
    publishedAt: new Date(job.created_at * 1000),
  };
}

// Free, public, no auth, no documented quota. Arbeitnow sorts by
// created_at desc and refreshes hourly, so a few pages per run cover a
// meaningfully wider slice than page 1 alone without hammering it.
export async function fetchArbeitnowOffers(): Promise<NewOffer[]> {
  const pages = Array.from({ length: PAGES_PER_RUN }, (_, i) => i + 1);
  const [perPage, cityIndex] = await Promise.all([
    mapWithConcurrency(pages, PAGE_CONCURRENCY, fetchPage),
    getCityIndex(),
  ]);
  const jobs = perPage.flat();

  return jobs.map((job) => build(job, cityIndex)).filter((offer): offer is NewOffer => offer !== null);
}
