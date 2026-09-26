import type { CountryCode } from "../constants";
import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex } from "../city-index";
import { mapWithConcurrency } from "../concurrency";
import type { NewOffer } from "../offers";

const SEARCH_URL = "https://europa.eu/eures/api/jv-searchengine/public/jv-search/search";
const DETAIL_URL = "https://europa.eu/eures/api/jv-searchengine/public/jv/id/";
const PORTAL_URL = "https://europa.eu/eures/portal/jv-se/jv-details/";

const RESULTS_PER_COUNTRY = Number(process.env.EURES_RESULTS_PER_COUNTRY ?? 25);
const DETAIL_CONCURRENCY = Number(process.env.EURES_DETAIL_CONCURRENCY ?? 6);
export const EURES_MAX_PAGE = 4; // rotated across runs — see route.ts

type EuresSearchResult = {
  jvs: { id: string; creationDate: number }[];
};

type EuresLocation = {
  countryCode: string;
  cityName: string | null;
};

type EuresProfile = {
  title: string;
  positionOfferingCode: string | null;
  locations: EuresLocation[];
  employer: { name: string };
  offeredRemunerationPackage?: {
    salaries?: { minimumSalary: number | null; maximumSalary: number | null; currencyCode: string; payingIntervalCode: string }[];
  };
  applicationInstructions?: string[];
};

type EuresDetail = {
  jvProfiles: Record<string, EuresProfile>;
};

function extractApplyUrl(profile: EuresProfile, id: string, lang: string): string {
  const raw = profile.applicationInstructions?.join(" ") ?? "";
  const match = raw.match(/href="([^"]+)"/);
  if (match) return match[1];
  return `${PORTAL_URL}${encodeURIComponent(id)}?lang=${lang}`;
}

function formatSalary(profile: EuresProfile): string | null {
  const salary = profile.offeredRemunerationPackage?.salaries?.[0];
  if (!salary || (!salary.minimumSalary && !salary.maximumSalary)) return null;
  const min = salary.minimumSalary;
  const max = salary.maximumSalary;
  const range = min && max ? `${min}-${max}` : String(min ?? max);
  return `${range} ${salary.currencyCode}/${salary.payingIntervalCode}`;
}

async function fetchDetail(id: string): Promise<EuresDetail | null> {
  try {
    const res = await fetch(`${DETAIL_URL}${encodeURIComponent(id)}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as EuresDetail;
  } catch {
    return null;
  }
}

export async function fetchEuresOffersForCountry(
  country: CountryCode,
  page = 1,
  isOverBudget: () => boolean = () => false
): Promise<NewOffer[]> {
  const cityIndex = await getCityIndex();
  const body = JSON.stringify({
    resultsPerPage: RESULTS_PER_COUNTRY,
    page,
    sortSearch: "MOST_RECENT",
    keywords: [],
    publicationPeriod: "LAST_THREE_DAYS",
    occupationUris: [],
    skillUris: [],
    requiredExperienceCodes: [],
    positionScheduleCodes: [],
    sectorCodes: [],
    educationAndQualificationLevelCodes: [],
    positionOfferingCodes: [],
    locationCodes: [country.toLowerCase()],
    euresFlagCodes: [],
    otherBenefitsCodes: [],
    requiredLanguages: [],
    minNumberPost: null,
    sessionId: `euro48-${Date.now()}`,
    requestLanguage: "en",
  });

  let search: EuresSearchResult | null = null;
  try {
    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    if (!res.ok) return [];
    search = (await res.json()) as EuresSearchResult;
  } catch {
    return [];
  }

  const jvs = search.jvs ?? [];

  const built = await mapWithConcurrency(jvs, DETAIL_CONCURRENCY, async (jv): Promise<NewOffer | null> => {
    if (isOverBudget()) return null;
    const detail = await fetchDetail(jv.id);
    if (!detail?.jvProfiles) return null;

    const lang = Object.keys(detail.jvProfiles)[0];
    const profile = detail.jvProfiles[lang];
    if (!profile) return null;

    const location = profile.locations?.find((l) => l.cityName);
    const { city, lat, lng } = resolveCity(cityIndex, location?.cityName ? [location.cityName] : [], country);

    const specialty = matchSpecialty(profile.title);

    return {
      id: `eures:${jv.id}`,
      titleOriginal: profile.title,
      titleEn: profile.title,
      titleFr: profile.title,
      titleEs: profile.title,
      company: profile.employer?.name || "—",
      countryCode: country,
      city,
      cityLat: lat,
      cityLng: lng,
      specialty,
      contractType: profile.positionOfferingCode ?? null,
      salaryRaw: formatSalary(profile),
      remote: /remote|télétravail|teletrabajo|teletravail/i.test(profile.title),
      languageOfAd: lang,
      url: extractApplyUrl(profile, jv.id, lang),
      source: "eures",
      publishedAt: new Date(jv.creationDate),
    };
  });

  return built.filter((offer): offer is NewOffer => offer !== null);
}
