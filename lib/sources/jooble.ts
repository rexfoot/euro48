import { matchSpecialty } from "../classify";
import { GULF_COUNTRIES, type GulfCountryCode } from "../gulf-constants";

const FETCH_TIMEOUT_MS = 15_000;

type JoobleJob = {
  id: string | number;
  title: string;
  location: string;
  company?: string;
  link: string;
  updated?: string;
  salary?: string;
  snippet?: string;
};

type JoobleResponse = {
  totalCount?: number;
  jobs?: JoobleJob[];
};

export type GulfOffer = {
  id: string;
  titleOriginal: string;
  company: string;
  countryCode: GulfCountryCode;
  city: string;
  specialty: ReturnType<typeof matchSpecialty>;
  url: string;
  source: string;
  publishedAt: Date;
};

async function fetchJoobleForCountry(apiKey: string, location: string): Promise<JoobleJob[]> {
  try {
    const res = await fetch(`https://jooble.org/api/${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as JoobleResponse;
    return data.jobs ?? [];
  } catch {
    return [];
  }
}

function build(job: JoobleJob, countryCode: GulfCountryCode, source: string): GulfOffer | null {
  if (!job.title || !job.link) return null;
  return {
    id: `${source}:${job.id}`,
    titleOriginal: job.title.trim(),
    company: job.company?.trim() || "—",
    countryCode,
    city: job.location?.trim() || countryCode,
    specialty: matchSpecialty(job.title),
    url: job.link,
    source,
    publishedAt: job.updated ? new Date(job.updated) : new Date(),
  };
}

// One Jooble call per Gulf country per worker run — called with a single
// country at a time (see app/api/worker/gulf/route.ts) so a GitHub Actions
// cron tick stays fast and spreads the 6 countries across runs.
export async function fetchJoobleGulfOffers(countryCode: GulfCountryCode): Promise<GulfOffer[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  const country = GULF_COUNTRIES.find((c) => c.code === countryCode);
  if (!country) return [];

  const jobs = await fetchJoobleForCountry(apiKey, country.joobleLocation);
  return jobs
    .map((job) => build(job, countryCode, "jooble"))
    .filter((offer): offer is GulfOffer => offer !== null);
}
