import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import { getCursor, setCursor } from "../worker-state";
import type { NewOffer } from "../offers";

// Unofficial API: the Bundesagentur fur Arbeit has no public API of its own.
// This is the community-documented endpoint behind its own "Jobsuche"
// website, authenticated with the shared client id everyone uses for it
// (there's no per-developer signup). Less stable than EURES/Adzuna/Arbeitnow
// by nature — if the agency changes or blocks this, every call below just
// returns nothing (see the try/catch), so it can never break the rest of
// the site. Germany only: the agency has no data for other countries.
//
// 2026-09-27: this used to loop over a hand-picked list of 7 German cities
// (25km radius, 40 results each — ~280/run at best). A plain unfiltered
// query reports `maxErgebnisse` in the hundreds of thousands nationwide —
// this was leaving the overwhelming majority of Germany uncovered. Now
// queries nationwide instead (no `wo`/location param at all) with
// `veroeffentlichtseit=1` (their own "posted within 1 day" bucket — the
// only close, verified-working value near our 48h window; 2 and 3 are
// silently ignored by their API and fall back to "no filter" at all,
// tested directly against the live endpoint), paginated across runs via a
// cursor exactly like EURES/Adzuna/Le Forem already do for their own
// per-run limits.
const SEARCH_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs";
const API_KEY = "jobboerse-jobsuche";
const PAGE_SIZE = 100; // API max
const PAGES_PER_RUN = Number(process.env.BA_PAGES_PER_RUN ?? 5);
const FETCH_TIMEOUT_MS = 15_000;

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
  maxErgebnisse?: number;
  ergebnisliste?: BaJob[];
};

async function fetchPage(page: number): Promise<{ jobs: BaJob[]; maxErgebnisse: number }> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set("angebotsart", "1"); // employment only, no apprenticeships
  url.searchParams.set("veroeffentlichtseit", "1");
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(PAGE_SIZE));

  try {
    const res = await fetch(url, {
      headers: { "X-API-Key": API_KEY, Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { jobs: [], maxErgebnisse: 0 };
    const data = (await res.json()) as BaSearchResult;
    return { jobs: data.ergebnisliste ?? [], maxErgebnisse: data.maxErgebnisse ?? 0 };
  } catch {
    return { jobs: [], maxErgebnisse: 0 };
  }
}

function build(job: BaJob, cityIndex: CityIndex): NewOffer | null {
  if (!job.stellenangebotsTitel) return null;

  const ort = job.stellenlokationen?.[0]?.adresse?.ort;
  const { city, lat, lng } = resolveCity(cityIndex, ort ? [ort] : [], "DE");
  const specialty = matchSpecialty(`${job.stellenangebotsTitel} ${job.hauptberuf ?? ""}`);
  const publishedAt = job.datumErsteVeroeffentlichung ? new Date(job.datumErsteVeroeffentlichung) : new Date();

  return {
    id: `ba:${job.referenznummer}`,
    titleOriginal: job.stellenangebotsTitel,
    titleEn: job.stellenangebotsTitel,
    titleFr: job.stellenangebotsTitel,
    titleEs: job.stellenangebotsTitel,
    company: job.firma || "—",
    countryCode: "DE",
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: job.vertragsdauer ?? null,
    salaryRaw: null,
    remote: job.homeofficemoeglich ?? false,
    languageOfAd: "de",
    url: job.externeURL || `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(job.referenznummer)}`,
    source: "bundesagentur",
    publishedAt,
  };
}

export async function fetchBundesagenturOffers(): Promise<NewOffer[]> {
  const cursor = await getCursor<{ page?: number }>("bundesagentur");
  let page = cursor.page ?? 1;

  const cityIndex = await getCityIndex();
  const jobs: BaJob[] = [];
  let maxErgebnisse = 0;
  let reachedEnd = false;

  for (let i = 0; i < PAGES_PER_RUN; i++) {
    const result = await fetchPage(page);
    maxErgebnisse = result.maxErgebnisse;
    jobs.push(...result.jobs);
    page += 1;
    if (result.jobs.length < PAGE_SIZE) {
      reachedEnd = true;
      break;
    }
  }

  const maxPage = maxErgebnisse > 0 ? Math.ceil(maxErgebnisse / PAGE_SIZE) : page;
  const nextPage = reachedEnd || page > maxPage ? 1 : page;
  await setCursor("bundesagentur", { page: nextPage });

  return jobs.map((job) => build(job, cityIndex)).filter((offer): offer is NewOffer => offer !== null);
}
