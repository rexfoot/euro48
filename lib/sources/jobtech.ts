import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex } from "../city-index";
import type { NewOffer } from "../offers";

// Sweden's public employment service (Arbetsförmedlingen / JobTech).
// Official, free, keyless — no signup, no per-developer key at all.
const SEARCH_URL = "https://jobsearch.api.jobtechdev.se/search";
const FETCH_TIMEOUT_MS = 15_000;
const LIMIT = Number(process.env.JOBTECH_LIMIT ?? 100); // API max is 100

type JobTechHit = {
  id: string;
  headline: string;
  webpage_url: string;
  publication_date: string;
  employer?: { name?: string };
  workplace_address?: { city?: string; municipality?: string };
  employment_type?: { label?: string };
  occupation?: { label?: string };
  description?: { text?: string };
};

type JobTechResponse = {
  hits?: JobTechHit[];
};

export async function fetchJobTechOffers(): Promise<NewOffer[]> {
  const since = new Date(Date.now() - 48 * 3_600_000).toISOString().split(".")[0];
  const url = new URL(SEARCH_URL);
  url.searchParams.set("q", "");
  url.searchParams.set("published-after", since);
  url.searchParams.set("sort", "pubdate-desc");
  url.searchParams.set("limit", String(LIMIT));

  let data: JobTechResponse;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return [];
    data = (await res.json()) as JobTechResponse;
  } catch {
    return [];
  }

  const hits = data.hits ?? [];
  const cityIndex = await getCityIndex();

  return hits
    .map((hit): NewOffer | null => {
      const specialty = matchSpecialty(`${hit.headline} ${hit.occupation?.label ?? ""}`);

      const cityRaw = hit.workplace_address?.city ?? hit.workplace_address?.municipality ?? "";
      const { city, lat, lng } = resolveCity(cityIndex, cityRaw ? [cityRaw] : [], "SE");

      return {
        id: `jobtech:${hit.id}`,
        titleOriginal: hit.headline,
        titleEn: hit.headline,
        titleFr: hit.headline,
        titleEs: hit.headline,
        company: hit.employer?.name || "—",
        countryCode: "SE",
        city,
        cityLat: lat,
        cityLng: lng,
        specialty,
        contractType: hit.employment_type?.label ?? null,
        salaryRaw: null,
        remote: /distans|remote|hemarbete/i.test(hit.headline),
        languageOfAd: "sv",
        url: hit.webpage_url,
        source: "jobtech",
        publishedAt: new Date(hit.publication_date),
      };
    })
    .filter((offer): offer is NewOffer => offer !== null);
}
