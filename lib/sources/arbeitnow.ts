import { LANGUAGE_BY_COUNTRY } from "../constants";
import { matchAnyCity, matchSpecialty } from "../classify";
import type { NewOffer } from "../offers";

const URL = "https://www.arbeitnow.com/api/job-board-api?page=1";
const FETCH_TIMEOUT_MS = 20_000;

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

// Free, public, no auth, no documented quota — a single page (page=1) is
// plenty since Arbeitnow itself only refreshes hourly.
export async function fetchArbeitnowOffers(): Promise<NewOffer[]> {
  let data: ArbeitnowResponse;
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.status === 429) return [];
    if (!res.ok) return [];
    data = (await res.json()) as ArbeitnowResponse;
  } catch {
    return [];
  }

  const jobs = data.data ?? [];

  return jobs
    .map((job): NewOffer | null => {
      const parts = job.location.split(",").map((p) => p.trim()).filter(Boolean);
      const match = matchAnyCity(parts);
      if (!match) return null;
      const { city, country } = match;

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
        specialty,
        contractType: job.job_types?.length ? job.job_types.join(", ") : null,
        salaryRaw: null,
        remote: job.remote,
        languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
        url: job.url,
        source: "arbeitnow",
        publishedAt: new Date(job.created_at * 1000),
      };
    })
    .filter((offer): offer is NewOffer => offer !== null);
}
