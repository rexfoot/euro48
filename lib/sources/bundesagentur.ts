import { citiesForCountry, OTHER_CITY, type CityName } from "../constants";
import { canonicalizeCity, matchSpecialty } from "../classify";
import { mapWithConcurrency } from "../concurrency";
import type { NewOffer } from "../offers";

// Unofficial API: the Bundesagentur fur Arbeit has no public API of its own.
// This is the community-documented endpoint behind its own "Jobsuche"
// website, authenticated with the shared client id everyone uses for it
// (there's no per-developer signup). Less stable than EURES/Adzuna/Arbeitnow
// by nature — if the agency changes or blocks this, every call below just
// returns nothing (see the try/catch), so it can never break the rest of
// the site. Germany only: the agency has no data for other countries.
const SEARCH_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";
const API_KEY = "jobboerse-jobsuche";
const RESULTS_PER_CITY = Number(process.env.BA_RESULTS_PER_CITY ?? 40);
const RADIUS_KM = 25;
const CITY_CONCURRENCY = 4;
const FETCH_TIMEOUT_MS = 12_000;

const DE_CITIES = citiesForCountry("DE");

type BaJob = {
  stellenangebotsTitel: string;
  hauptberuf?: string;
  firma?: string;
  referenznummer: string;
  externeURL?: string;
  vertragsdauer?: string;
  homeofficemoeglich?: boolean;
  datumErsteVeroeffentlichung?: string;
  stellenlokationen?: { adresse?: { ort?: string } }[];
};

type BaSearchResult = {
  ergebnisliste?: BaJob[];
};

async function fetchForCity(city: CityName): Promise<NewOffer[]> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("wo", city);
  url.searchParams.set("umkreis", String(RADIUS_KM));
  url.searchParams.set("page", "1");
  url.searchParams.set("size", String(RESULTS_PER_CITY));
  url.searchParams.set("angebotsart", "1"); // employment only, no apprenticeships

  let data: BaSearchResult;
  try {
    const res = await fetch(url, {
      headers: { "X-API-Key": API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    data = (await res.json()) as BaSearchResult;
  } catch {
    return [];
  }

  const jobs = data.ergebnisliste ?? [];

  return jobs
    .map((job): NewOffer | null => {
      const ort = job.stellenlokationen?.[0]?.adresse?.ort;
      const matchedCity = (ort && canonicalizeCity([ort])) || OTHER_CITY;

      const specialty = matchSpecialty(`${job.stellenangebotsTitel} ${job.hauptberuf ?? ""}`);
      if (!specialty) return null;

      const publishedAt = job.datumErsteVeroeffentlichung
        ? new Date(job.datumErsteVeroeffentlichung)
        : new Date();

      return {
        id: `ba:${job.referenznummer}`,
        titleOriginal: job.stellenangebotsTitel,
        titleEn: job.stellenangebotsTitel,
        titleFr: job.stellenangebotsTitel,
        titleEs: job.stellenangebotsTitel,
        company: job.firma || "—",
        countryCode: "DE",
        city: matchedCity,
        specialty,
        contractType: job.vertragsdauer ?? null,
        salaryRaw: null,
        remote: job.homeofficemoeglich ?? false,
        languageOfAd: "de",
        url:
          job.externeURL ||
          `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(job.referenznummer)}`,
        source: "bundesagentur",
        publishedAt,
      };
    })
    .filter((offer): offer is NewOffer => offer !== null);
}

export async function fetchBundesagenturOffers(): Promise<NewOffer[]> {
  const perCity = await mapWithConcurrency(DE_CITIES, CITY_CONCURRENCY, fetchForCity);
  return perCity.flat();
}
