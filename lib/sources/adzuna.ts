import { LANGUAGE_BY_COUNTRY, type CountryCode } from "../constants";
import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex } from "../city-index";
import type { NewOffer } from "../offers";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const RESULTS_PER_CALL = Number(process.env.ADZUNA_RESULTS_PER_CALL ?? 50);
const FETCH_TIMEOUT_MS = 15_000;

// Countries Adzuna's API actually supports, verified live (Adzuna returns
// UNSUPPORTED_COUNTRY for the rest: LU, IE, NO, DK, SE, FI, IS, and — as of
// the PT/PL/GB addition 2026-09-28 — PT too; GB and PL both work).
export const ADZUNA_COUNTRIES: CountryCode[] = ["DE", "NL", "CH", "BE", "AT", "FR", "ES", "IT", "PL", "GB"];
export const ADZUNA_MAX_PAGE = 2; // rotated across runs — see route.ts

const CURRENCY_BY_COUNTRY: Partial<Record<CountryCode, string>> = {
  CH: "CHF",
  GB: "GBP",
  PL: "PLN",
};

type AdzunaJob = {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  redirect_url: string;
  created: string;
  contract_type?: string;
  contract_time?: string;
  salary_min?: number;
  salary_max?: number;
};

type AdzunaSearchResult = {
  results?: AdzunaJob[];
};

// Country (and now page) chosen by the caller (route.ts rotates both via a
// DB cursor) to stay well under Adzuna's free-tier cap: 250/day but only
// 2500/month is the real ceiling.
export async function fetchAdzunaOffersForCountry(country: CountryCode, page = 1): Promise<NewOffer[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  if (!ADZUNA_COUNTRIES.includes(country)) return [];

  const url = new URL(`${BASE_URL}/${country.toLowerCase()}/search/${page}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("results_per_page", String(RESULTS_PER_CALL));
  url.searchParams.set("max_days_old", "2");
  url.searchParams.set("sort_by", "date");

  let data: AdzunaSearchResult;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (res.status === 429) {
      console.error(`[adzuna] ${country} p${page}: 429 quota hit, skipping this run`);
      return [];
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[adzuna] ${country} p${page}: HTTP ${res.status} — ${body.slice(0, 300)}`);
      return [];
    }
    data = (await res.json()) as AdzunaSearchResult;
  } catch (err) {
    console.error(`[adzuna] ${country} p${page}: fetch threw — ${(err as Error).message}`);
    return [];
  }

  const jobs = data.results ?? [];
  const cityIndex = await getCityIndex();

  return jobs
    .map((job): NewOffer | null => {
      const candidates = [
        ...(job.location?.area ? [...job.location.area].reverse() : []),
        job.location?.display_name ?? "",
      ];
      const { city, lat, lng } = resolveCity(cityIndex, candidates, country);

      const specialty = matchSpecialty(job.title);

      const currency = CURRENCY_BY_COUNTRY[country] ?? "EUR";
      const salaryRaw =
        job.salary_min || job.salary_max
          ? `${job.salary_min && job.salary_max ? `${Math.round(job.salary_min)}-${Math.round(job.salary_max)}` : Math.round(job.salary_min || job.salary_max || 0)} ${currency}`
          : null;

      return {
        id: `adzuna:${job.id}`,
        titleOriginal: job.title,
        titleEn: job.title,
        titleFr: job.title,
        titleEs: job.title,
        company: job.company?.display_name || "—",
        countryCode: country,
        city,
        cityLat: lat,
        cityLng: lng,
        specialty,
        contractType: job.contract_type ?? job.contract_time ?? null,
        salaryRaw,
        remote: /remote|t[ée]l[ée]travail|teletrabajo|home ?office/i.test(job.title),
        languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
        url: job.redirect_url,
        source: "adzuna",
        publishedAt: new Date(job.created),
      };
    })
    .filter((offer): offer is NewOffer => offer !== null);
}
