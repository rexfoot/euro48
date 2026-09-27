// Shared city/specialty matching, reused by every source module.
//
// Cities are resolved against the real GeoNames database (lib/city-index.ts,
// ~44k real cities/towns across our 15 countries, 2026-09-26) instead of a
// hand-written list — GeoNames already merges native-language spellings
// under one canonical name via its alternatenames, so "GÖTEBORG" and
// "Göteborg" both resolve to the same Gothenburg record. Only when a real
// place truly isn't in GeoNames (population under 1000) do we fall back to
// accepting the raw text as a new city, title-cased.

import { OTHER_CITY, SPECIALTIES, type CountryCode, type SpecialtyId } from "./constants";
import { normalizeForFingerprint } from "./fingerprint";
import type { CityIndex, CityRecord } from "./city-index";

// For sources with no per-country context of their own (Arbeitnow's feed
// is global): a country name mentioned anywhere in the location text, used
// only once GeoNames itself has failed to place the city (which also gives
// us the country for free).
const COUNTRY_NAME_ALIASES: Record<string, CountryCode> = {
  germany: "DE", allemagne: "DE", alemania: "DE", deutschland: "DE",
  netherlands: "NL", "pays bas": "NL", holland: "NL", nederland: "NL", paisesbajos: "NL",
  switzerland: "CH", suisse: "CH", suiza: "CH", schweiz: "CH", svizzera: "CH",
  luxembourg: "LU", luxemburgo: "LU", luxemburg: "LU",
  belgium: "BE", belgique: "BE", belgica: "BE", belgie: "BE", belgien: "BE",
  austria: "AT", autriche: "AT", osterreich: "AT",
  ireland: "IE", irlande: "IE", irlanda: "IE",
  france: "FR", francia: "FR", frankreich: "FR",
  spain: "ES", espagne: "ES", espana: "ES", spanien: "ES",
  italy: "IT", italie: "IT", italia: "IT", italien: "IT",
  norway: "NO", norvege: "NO", noruega: "NO", norge: "NO",
  denmark: "DK", danemark: "DK", dinamarca: "DK", danmark: "DK",
  sweden: "SE", suede: "SE", suecia: "SE", sverige: "SE",
  finland: "FI", finlande: "FI", finlandia: "FI", suomi: "FI",
  iceland: "IS", islande: "IS", islandia: "IS", island: "IS",
  // Added 2026-09-28 with PT/PL/GB — found live: a Polish job-center
  // posting with no real city in its location data was resolving to a
  // "city" literally named "Polska" (Polish for "Poland"), since that
  // wasn't yet in this list of names to reject as "a country, not a city".
  portugal: "PT", portugalia: "PT",
  poland: "PL", pologne: "PL", polonia: "PL", polska: "PL",
  "united kingdom": "GB", "royaume uni": "GB", "reino unido": "GB",
  "great britain": "GB", "grande bretagne": "GB", "gran bretana": "GB", uk: "GB",
};

// A source that states its country as plain text (e.g. Greenhouse's
// offices[].location, "City, Region, Country") can be resolved directly
// against the same alias table, without going through a city match at
// all — used as an authoritative allow/reject gate ahead of fuzzy city
// text matching (see lib/sources/greenhouse.ts).
export function countryFromName(piece: string): CountryCode | null {
  return COUNTRY_NAME_ALIASES[normalizeForFingerprint(piece)] ?? null;
}

// Words that mean this piece is a company/street/postcode fragment, not a
// city — only relevant for sources that occasionally hand us a raw
// multi-line address block instead of a clean city field (seen from EURES
// for Ireland).
const NOT_A_CITY_WORDS = [
  "ltd", "limited", "gmbh", "sarl", "sas", "sa", "sl", "bv", "srl", "plc", "inc",
  "road", "street", "avenue", "lane", "drive", "way", "close", "park", "unit",
  "remote", "hybrid", "teletravail", "teletrabajo", "homeoffice",
];

// Irish addresses commonly prefix the county town with "Co." / "County"
// (e.g. "Co. Cork") — strip it so the actual place name underneath can
// still be found in GeoNames instead of being rejected as noise.
function stripCountyPrefix(piece: string): string {
  return piece.replace(/^(co\.?|county)\s+/i, "").trim();
}

function looksLikePlaceName(piece: string): boolean {
  if (/\d/.test(piece)) return false; // postcodes, unit numbers
  if (piece.length < 2 || piece.length > 40) return false;
  if (COUNTRY_NAME_ALIASES[normalizeForFingerprint(piece)]) return false; // "France", "Deutschland"... is a country, not a city
  const rawWords = piece.toLowerCase().split(/\s+/);
  if (rawWords.some((w) => NOT_A_CITY_WORDS.includes(w.replace(/\.$/, "")))) return false;
  if (piece === piece.toUpperCase() && rawWords.length > 2) return false; // long ALL-CAPS phrases: usually a company name
  return true;
}

function titleCase(piece: string): string {
  return piece
    .split(/(\s+|-)/) // keep the separators so "Saint-Etienne" stays hyphenated
    .map((w) => (w && /[a-zà-ÿ]/i.test(w) ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join("");
}

// Splits a raw location string into every plausible place-name piece —
// sources format this wildly differently, from "City, Region" to a full
// multi-line address block.
function splitIntoPieces(raw: string): string[] {
  return raw
    .split(/[,/()\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Tries every piece of the raw location text against a GeoNames name map
// (either one country's, or the cross-country `global` one — see below).
// Returns the matched record, or null if none of the pieces are known.
function lookupPieces(map: Map<string, CityRecord>, rawPieces: string[]): CityRecord | null {
  for (const raw of rawPieces.flatMap(splitIntoPieces)) {
    const rec = map.get(normalizeForFingerprint(stripCountyPrefix(raw)));
    if (rec) return rec;
  }
  return null;
}

// Last resort when GeoNames doesn't have the place at all (population
// under 1000) — never a reason to drop a real offer, just accept the
// text as a brand-new city, title-cased for a consistent display.
function fallbackCityName(rawPieces: string[]): string | null {
  for (const raw of rawPieces.flatMap(splitIntoPieces)) {
    const cleaned = stripCountyPrefix(raw);
    if (looksLikePlaceName(cleaned)) return titleCase(cleaned);
  }
  return null;
}

export type ResolvedCity = { city: string; lat: number | null; lng: number | null };

// For a source that already knows its own country (EURES/Adzuna/
// Bundesagentur/JobTech/NAV): resolve the city within that country's own
// GeoNames names first (so a same-named town in a different country can
// never be picked over the real one the source told us about), falling
// back to a cross-country match only if that fails entirely (a source
// mislabeling its own country), then the raw-text fallback, then "Other".
export function resolveCity(index: CityIndex, rawPieces: string[], country: CountryCode): ResolvedCity {
  const countryMap = index.byCountry.get(country);
  const rec = (countryMap && lookupPieces(countryMap, rawPieces)) || lookupPieces(index.global, rawPieces);
  if (rec) return { city: rec.name, lat: rec.lat, lng: rec.lng };
  return { city: fallbackCityName(rawPieces) ?? OTHER_CITY, lat: null, lng: null };
}

// US state postal codes + a few other unambiguous non-EU-market markers.
// GeoNames' alternatenames for small European towns occasionally happen to
// spell out a big non-European city's name too (e.g. "Sant Francesc de
// Formentera" in Spain also lists "San Francisco" — found live 2026-09-27
// via Greenhouse/Lever US postings like "San Francisco, CA" getting placed
// in Spain). A piece like ", CA" or ", NY" right next to that match is
// conclusive proof the real place is NOT in our 15 countries, so it's
// checked first and short-circuits the whole lookup rather than trusting
// the coincidental city-name match.
// Checked as whole words only (never substring) — a naive substring check
// would false-positive on real EU places that merely contain these letters,
// e.g. "Cannes".includes("ca"). Deliberately excludes codes that double as
// ordinary words in our target languages or common job-posting suffixes:
// "co" (Irish "Co. Cork"), "il"/"la" (French/Italian articles), "in"/"on"
// ("In-office"/"On-site" tags), "me" (pronoun), "or" (conjunction), and all
// Canadian province codes (qc/on collide the same way) — "canada" alone
// covers that market safely.
const NON_EU_WORD_MARKERS = new Set([
  "usa", "us", "canada", "uk",
  "al", "ak", "az", "ar", "ca", "ct", "fl", "ga", "hi", "id", "ia", "ks", "ky",
  "md", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd",
  "oh", "ok", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy", "dc",
  "india", "bangalore", "singapore",
]);
// Checked as substrings — multi-word phrases with no realistic collision
// risk against a European place name.
const NON_EU_PHRASE_MARKERS = ["united states", "united kingdom"];

function hasNonEuMarker(rawPieces: string[]): boolean {
  return rawPieces.flatMap(splitIntoPieces).some((p) => {
    const normalized = normalizeForFingerprint(p);
    if (NON_EU_PHRASE_MARKERS.some((phrase) => normalized.includes(phrase))) return true;
    return normalized.split(" ").some((word) => NON_EU_WORD_MARKERS.has(word));
  });
}

// For Arbeitnow, which has no per-country field at all: a GeoNames match
// (searched across all 15 countries — nothing else to scope it by) gives
// us the country for free; otherwise look for a country name mentioned
// anywhere in the text. Returns null only when the offer can't be placed
// in any of our 15 countries at all — city alone is never a reason to
// drop it.
export function resolveCityWithCountry(
  index: CityIndex,
  rawPieces: string[]
): (ResolvedCity & { country: CountryCode }) | null {
  if (hasNonEuMarker(rawPieces)) return null;

  const rec = lookupPieces(index.global, rawPieces);
  if (rec) return { city: rec.name, country: rec.country, lat: rec.lat, lng: rec.lng };

  const allPieces = rawPieces.flatMap(splitIntoPieces);
  let country: CountryCode | null = null;
  for (const piece of allPieces) {
    const found = COUNTRY_NAME_ALIASES[normalizeForFingerprint(piece)];
    if (found) {
      country = found;
      break;
    }
  }
  if (!country) return null;

  const cityPieces = allPieces.filter((p) => !COUNTRY_NAME_ALIASES[normalizeForFingerprint(p)]);
  return { city: fallbackCityName(cityPieces) ?? OTHER_CITY, country, lat: null, lng: null };
}

// Compound-final languages (Finnish, Swedish, Norwegian, Dutch, German, ...)
// fuse the occupation noun onto the end of a modifier with no separator —
// "Sähköasentaja" (electrician), "Taksinkuljettaja" (taxi driver) — so an
// exact-token check alone (tokens.has(kw)) never fires for them. A keyword
// long enough (>=6 letters) is vanishingly unlikely to end an unrelated
// word by coincidence, so it doubles as a safe suffix check; shorter
// keywords ("bau", "arts", "kok"...) stay exact-token-only to avoid
// collisions with ordinary English/French/Spanish words.
const SUFFIX_MIN_LENGTH = 6;

// Never drops a real offer for not matching one of the 8 named trades —
// falls back to the "other" catch-all specialty instead (spec 2026-09-26).
export function matchSpecialty(title: string): SpecialtyId {
  const normalized = title.toLowerCase();
  const tokens = new Set(normalized.match(/\p{L}+/gu) ?? []);

  for (const specialty of SPECIALTIES) {
    const hit = specialty.keywords.some((kw) => {
      if (kw.includes(" ")) return normalized.includes(kw);
      if (tokens.has(kw)) return true;
      if (kw.length >= SUFFIX_MIN_LENGTH) {
        for (const token of tokens) if (token.endsWith(kw)) return true;
      }
      return false;
    });
    if (hit) return specialty.id;
  }
  return "other";
}
