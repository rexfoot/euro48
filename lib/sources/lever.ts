import { COUNTRY_CODES, LANGUAGE_BY_COUNTRY, OFFER_VISIBLE_HOURS, type CountryCode } from "../constants";
import { resolveCity, resolveCityWithCountry, matchSpecialty } from "../classify";
import { getCityIndex, type CityIndex } from "../city-index";
import { mapWithConcurrency } from "../concurrency";
import type { NewOffer } from "../offers";

const FETCH_TIMEOUT_MS = 20_000;
const BOARD_CONCURRENCY = 5;

// Company slugs verified live (HTTP 200) against api.lever.co. Mostly
// European companies (real EU hiring volume) plus a couple of US ones.
// Confirmed-404 tokens tried and excluded: netdata, plaid, ramp, scale,
// rippling, checkr, grammarly, loom, carta, amplitude, segment, mixpanel,
// sourcegraph, eventbrite, box, brex, figma, attentive, netflix, canva,
// klarna, revolut, monzo, trustpilot, zendesk, yelp, github, gitlab-inc,
// bolt, getyourguide, travelperk, personio-gmbh, celonis, flixbus,
// zalando, algolia, alan, spendesk, payfit, gocardless, typeform,
// backmarket, trivago, babbel, bolt-eu, deezer, criteo, ledger, doctolib,
// welcometothejungle, sorare, luko, shine, leetchi, lydia, zenly, voodoo,
// dashlane, algoan.
const COMPANY_SLUGS = [
  "palantir", "spotify", "contentsquare", "qonto", "blablacar", "swile",
  "malt", "younited",
];

type LeverPosting = {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl?: string;
  createdAt: number; // unix ms — true posting timestamp
  country?: string; // ISO-2
  categories?: {
    location?: string;
    allLocations?: string[];
    commitment?: string;
    team?: string;
  };
};

async function fetchBoard(company: string): Promise<LeverPosting[]> {
  try {
    const res = await fetch(`https://api.lever.co/v0/postings/${company}?mode=json`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as LeverPosting[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Lever gives an explicit ISO-2 `country` on most postings — far more
// reliable than fuzzy-matching the free-text location (which caused real
// bugs: e.g. a Spotify posting for "Los Angeles, CA" with country "US" was
// getting matched to a Spanish town whose GeoNames alternate name happens
// to also read "Los Angeles"). When `country` is present it's authoritative:
// reject outright if it's not one of our 15, never fall through to text
// matching for those. Only postings missing `country` fall back to the
// old cross-country text search.
function build(posting: LeverPosting, company: string, cityIndex: CityIndex): NewOffer | null {
  const locationName = posting.categories?.location;
  if (!locationName) return null;
  const parts = locationName.split(",").map((p) => p.trim()).filter(Boolean);

  let city: string, country: CountryCode, lat: number | null, lng: number | null;
  if (posting.country) {
    if (!COUNTRY_CODES.includes(posting.country as CountryCode)) return null;
    country = posting.country as CountryCode;
    const resolved = resolveCity(cityIndex, parts, country);
    city = resolved.city;
    lat = resolved.lat;
    lng = resolved.lng;
  } else {
    const match = resolveCityWithCountry(cityIndex, parts);
    if (!match) return null;
    ({ city, country, lat, lng } = match);
  }

  const specialty = matchSpecialty(posting.text);

  return {
    id: `lever:${company}:${posting.id}`,
    titleOriginal: posting.text,
    titleEn: posting.text,
    titleFr: posting.text,
    titleEs: posting.text,
    company,
    countryCode: country,
    city,
    cityLat: lat,
    cityLng: lng,
    specialty,
    contractType: posting.categories?.commitment ?? null,
    salaryRaw: null,
    remote: /remote/i.test(locationName),
    languageOfAd: LANGUAGE_BY_COUNTRY[country] ?? "en",
    url: posting.hostedUrl,
    source: "lever",
    publishedAt: new Date(posting.createdAt),
  };
}

// Free, public, no auth, no documented quota. createdAt is a true, direct
// posting timestamp (no first_published/updated_at ambiguity like
// Greenhouse) so no extra per-job calls are needed.
export async function fetchLeverOffers(): Promise<NewOffer[]> {
  const cutoff = Date.now() - OFFER_VISIBLE_HOURS * 3_600_000;
  const [perBoard, cityIndex] = await Promise.all([
    mapWithConcurrency(COMPANY_SLUGS, BOARD_CONCURRENCY, async (company) => {
      const postings = await fetchBoard(company);
      return postings.map((posting) => ({ posting, company }));
    }),
    getCityIndex(),
  ]);

  const postings = perBoard.flat().filter(({ posting }) => posting.createdAt >= cutoff);

  return postings
    .map(({ posting, company }) => build(posting, company, cityIndex))
    .filter((offer): offer is NewOffer => offer !== null);
}
