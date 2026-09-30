import { LANGUAGE_BY_COUNTRY } from "../constants";
import { resolveCityWithCountry, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import type { NewOffer } from "../offers";

const FETCH_TIMEOUT_MS = 20_000;

type LinkedInJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  visa_sponsorship?: boolean;
};

async function fetchPage(keyword: string): Promise<LinkedInJob[]> {
  try {
    const res = await fetch(`https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(keyword)}&location=Europe`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.jobs ?? data.data ?? [];
  } catch {
    return [];
  }
}

function build(job: LinkedInJob, cityIndex: CityIndex): NewOffer | null {
  const parts = job.location.split(",").map((p) => p.trim()).filter(Boolean);
  const match = resolveCityWithCountry(cityIndex, parts);
  if (!match) return null;
  const { city, country, lat, lng } = match;

  const specialty = matchSpecialty(job.title);

  return {
    id: `linkedinradar:${job.id}`,
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
    contractType: null,
    salaryRaw: null,
    remote: false,
    languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
    url: job.url,
    source: "linkedinradar",
    publishedAt: new Date(),
  };
}

export async function fetchLinkedInRadarOffers(): Promise<NewOffer[]> {
  const cityIndex = await getCityIndex();
  const keywords = ["visa sponsorship", "relocation", "international hire"];
  const allJobs: LinkedInJob[] = [];

  for (const keyword of keywords) {
    const jobs = await fetchPage(keyword);
    allJobs.push(...jobs);
  }

  return allJobs.map((job) => build(job, cityIndex)).filter((offer): offer is NewOffer => offer !== null);
}
