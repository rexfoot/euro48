import { LANGUAGE_BY_COUNTRY, OFFER_VISIBLE_HOURS } from "../constants";
import { resolveCityWithCountry, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import { mapWithConcurrency } from "../concurrency";
import type { NewOffer } from "../offers";

const FETCH_TIMEOUT_MS = 20_000;
const BOARD_CONCURRENCY = 5;

// Board tokens verified live (HTTP 200) against boards-api.greenhouse.io.
// Most of these are US-heavy companies — postings outside our 15 countries
// are dropped naturally by resolveCityWithCountry below, same as every
// other source. Confirmed-404 tokens (spotify, revolut, klarna, personio,
// snyk, doordash, notion, canva, miro, zapier, retool, linear, openai) are
// deliberately excluded.
const BOARD_TOKENS = [
  "stripe", "airbnb", "doctolib", "n26", "wise", "datadog", "contentful",
  "deliveroo", "pinterest", "coursera", "gitlab", "robinhood", "asana",
  "affirm", "instacart", "reddit", "discord", "figma", "webflow", "vercel",
  "netlify", "cloudflare", "elastic", "mongodb", "databricks", "scaleai",
  "anthropic",
];

type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  company_name?: string;
  first_published?: string; // ISO date, the true original post date
  updated_at?: string;
};

type GreenhouseResponse = {
  jobs?: GreenhouseJob[];
};

async function fetchBoard(token: string): Promise<GreenhouseJob[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as GreenhouseResponse;
    return data.jobs ?? [];
  } catch {
    return [];
  }
}

function build(job: GreenhouseJob, token: string, cityIndex: CityIndex): NewOffer | null {
  const locationName = job.location?.name;
  if (!locationName) return null;
  const parts = locationName.split(",").map((p) => p.trim()).filter(Boolean);
  const match = resolveCityWithCountry(cityIndex, parts);
  if (!match) return null;
  const { city, country, lat, lng } = match;

  const specialty = matchSpecialty(job.title);

  return {
    id: `greenhouse:${token}:${job.id}`,
    titleOriginal: job.title,
    titleEn: job.title,
    titleFr: job.title,
    titleEs: job.title,
    company: job.company_name || token,
    countryCode: country,
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: null,
    salaryRaw: null,
    remote: /remote/i.test(locationName),
    languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
    url: job.absolute_url,
    source: "greenhouse",
    publishedAt: new Date(job.first_published || job.updated_at || Date.now()),
  };
}

// Free, public, no auth, no documented quota — one call per company board
// (content=true includes first_published, so no per-job detail calls
// needed). Filtered to postings whose true first_published date (NOT the
// often-stale updated_at) falls inside our visibility window.
export async function fetchGreenhouseOffers(): Promise<NewOffer[]> {
  const cutoff = Date.now() - OFFER_VISIBLE_HOURS * 3_600_000;
  const [perBoard, cityIndex] = await Promise.all([
    mapWithConcurrency(BOARD_TOKENS, BOARD_CONCURRENCY, async (token) => {
      const jobs = await fetchBoard(token);
      return jobs.map((job) => ({ job, token }));
    }),
    getCityIndex(),
  ]);

  const jobs = perBoard.flat().filter(({ job }) => {
    const published = job.first_published ? new Date(job.first_published).getTime() : NaN;
    return !Number.isNaN(published) && published >= cutoff;
  });

  return jobs
    .map(({ job, token }) => build(job, token, cityIndex))
    .filter((offer): offer is NewOffer => offer !== null);
}
