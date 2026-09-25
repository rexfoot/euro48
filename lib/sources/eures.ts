import { CITIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "../constants";
import { normalizeForFingerprint } from "../fingerprint";
import type { NewOffer } from "../offers";

const SEARCH_URL = "https://europa.eu/eures/api/jv-searchengine/public/jv-search/search";
const DETAIL_URL = "https://europa.eu/eures/api/jv-searchengine/public/jv/id/";
const PORTAL_URL = "https://europa.eu/eures/portal/jv-se/jv-details/";

const RESULTS_PER_COUNTRY = Number(process.env.EURES_RESULTS_PER_COUNTRY ?? 10);

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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function matchCity(rawCityName: string, country: CountryCode): string | null {
  const candidate = rawCityName.split(/[,/(]/)[0].trim();
  const normalizedCandidate = normalizeForFingerprint(candidate);

  for (const cityName of Object.keys(CITIES) as (keyof typeof CITIES)[]) {
    if (CITIES[cityName].country !== country) continue;
    if (normalizeForFingerprint(cityName) === normalizedCandidate) return cityName;
  }
  return null;
}

function matchSpecialty(title: string): SpecialtyId | null {
  const normalized = title.toLowerCase();
  const tokens = new Set(normalized.match(/\p{L}+/gu) ?? []);

  for (const specialty of SPECIALTIES) {
    const hit = specialty.keywords.some((kw) =>
      kw.includes(" ") ? normalized.includes(kw) : tokens.has(kw)
    );
    if (hit) return specialty.id;
  }
  return null;
}

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

export async function fetchEuresOffersForCountry(country: CountryCode): Promise<NewOffer[]> {
  const body = JSON.stringify({
    resultsPerPage: RESULTS_PER_COUNTRY,
    page: 1,
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

  const offers: NewOffer[] = [];

  for (const jv of search.jvs ?? []) {
    const detail = await fetchDetail(jv.id);
    await sleep(120);
    if (!detail?.jvProfiles) continue;

    const lang = Object.keys(detail.jvProfiles)[0];
    const profile = detail.jvProfiles[lang];
    if (!profile) continue;

    const location = profile.locations?.find((l) => l.cityName);
    if (!location?.cityName) continue;

    const city = matchCity(location.cityName, country);
    if (!city) continue;

    const specialty = matchSpecialty(profile.title);
    if (!specialty) continue;

    offers.push({
      id: `eures:${jv.id}`,
      titleOriginal: profile.title,
      titleEn: profile.title,
      titleFr: profile.title,
      titleEs: profile.title,
      company: profile.employer?.name || "—",
      countryCode: country,
      city,
      specialty,
      contractType: profile.positionOfferingCode ?? null,
      salaryRaw: formatSalary(profile),
      remote: /remote|télétravail|teletrabajo|teletravail/i.test(profile.title),
      languageOfAd: lang,
      url: extractApplyUrl(profile, jv.id, lang),
      source: "eures",
      publishedAt: new Date(jv.creationDate),
    });
  }

  return offers;
}
