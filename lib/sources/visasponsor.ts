import { LANGUAGE_BY_COUNTRY } from "../constants";
import { resolveCityWithCountry, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import type { NewOffer } from "../offers";

const BASE_URL = "https://visasponsor.jobs/api/jobs";
const FETCH_TIMEOUT_MS = 20_000;

type VisaSponsorJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  visa_type?: string;
  country?: string;
};

async function fetchPage(page: number): Promise<VisaSponsorJob[]> {
  try {
    const res = await fetch(`${BASE_URL}?page=${page}`, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs ?? data.data ?? [];
  } catch {
    return [];
  }
}

function build(job: VisaSponsorJob, cityIndex: CityIndex): NewOffer | null {
  const parts = job.location.split(",").map((p) => p.trim()).filter(Boolean);
  const match = resolveCityWithCountry(cityIndex, parts);
  if (!match) return null;
  const { city, country, lat, lng } = match;

  const specialty = matchSpecialty(job.title);

  return {
    id: `visasponsor:${job.id}`,
    titleOriginal: job.title,
    titleEn: job.title,
    titleFr: job.title,
    titleEs: job.title,
    company: job.company || "—",
    countryCode: country,
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: job.visa_type ?? null,
    salaryRaw: null,
    remote: false,
    languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
    url: job.url,
    source: "visasponsor",
    publishedAt: new Date(),
  };
}

export async function fetchVisaSponsorOffers(): Promise<NewOffer[]> {
  const cityIndex = await getCityIndex();
  const jobs = await fetchPage(1);
  return jobs.map((job) => build(job, cityIndex)).filter((offer): offer is NewOffer => offer !== null);
}
