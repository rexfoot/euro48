// Shared city/specialty matching, reused by every source module.
//
// Cities are now OPEN (2026-09-26): any real place name a source gives us
// becomes a city, instead of being dropped for not being on a fixed list
// of ~58. We still recognize known native-language spellings (so
// "GÖTEBORG"/"Göteborg" collapse into the one "Gothenburg" row rather than
// creating near-duplicate cities) via the alias table below; anything else
// is accepted as its own new city, title-cased for a consistent display.

import { CITIES, OTHER_CITY, SPECIALTIES, type CityName, type CountryCode, type SpecialtyId } from "./constants";
import { normalizeForFingerprint } from "./fingerprint";

// For sources with no per-country context of their own (Arbeitnow's feed
// is global) — lets us infer the country from a country name mentioned
// anywhere in the location text, so a brand-new (not-yet-known) city can
// still be filed under the right one of our 15 countries.
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
};

// Native-language / alternate spellings that differ from our (English)
// reference spellings by more than accents.
const CITY_ALIASES: Partial<Record<string, CityName>> = {
  munchen: "Munich", muenchen: "Munich",
  koln: "Cologne", koeln: "Cologne",
  duesseldorf: "Düsseldorf",
  wien: "Vienna",
  geneve: "Geneva", genf: "Geneva", ginevra: "Geneva",
  bale: "Basel", basle: "Basel",
  bruxelles: "Brussels", brussel: "Brussels",
  antwerpen: "Antwerp", anvers: "Antwerp",
  gent: "Ghent", gand: "Ghent",
  luik: "Liège",
  "den haag": "The Hague", "s gravenhage": "The Hague",
  sevilla: "Seville",
  milano: "Milan",
  roma: "Rome",
  torino: "Turin",
  firenze: "Florence",
  venezia: "Venice",
  napoli: "Naples",
  goteborg: "Gothenburg",
  kobenhavn: "Copenhagen",
  arhus: "Aarhus",
  alborg: "Aalborg",
  helsingfors: "Helsinki",
};

// Words that mean this piece is a company/street/postcode fragment, not a
// city — only relevant for sources that occasionally hand us a raw
// multi-line address block instead of a clean city field (seen from EURES
// for Ireland).
const NOT_A_CITY_WORDS = [
  "ltd", "limited", "gmbh", "sarl", "sas", "sa", "sl", "bv", "srl", "plc", "inc", "co",
  "road", "street", "avenue", "lane", "drive", "way", "close", "park", "unit",
  "remote", "hybrid", "teletravail", "teletrabajo", "homeoffice",
];

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

function resolveKnownCity(normalizedCandidate: string): CityName | null {
  for (const cityName of Object.keys(CITIES) as CityName[]) {
    if (normalizeForFingerprint(cityName) === normalizedCandidate) return cityName;
  }
  return CITY_ALIASES[normalizedCandidate] ?? null;
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

// Turns whatever raw location text a source gives us into a city name.
// Never rejects a real place — first tries every piece against known
// cities/aliases (so spelling variants collapse together), then falls
// back to accepting the first piece that looks like a place name at all,
// title-cased for a consistent display. Returns null only when there's
// truly nothing usable (the caller should file the offer under "Other").
export function canonicalizeCity(rawPieces: string[]): string | null {
  const allPieces = rawPieces.flatMap(splitIntoPieces);

  for (const piece of allPieces) {
    const known = resolveKnownCity(normalizeForFingerprint(piece));
    if (known) return known;
  }

  for (const piece of allPieces) {
    if (looksLikePlaceName(piece)) return titleCase(piece);
  }

  return null;
}

// For sources with no per-country field at all (Arbeitnow): resolves both
// city and country from free-text location. A known city gives us the
// country for free; otherwise we look for a country name mentioned
// anywhere in the text. Returns null only when we can't place the offer
// in any of our 15 countries at all — city alone is never a reason to drop it.
export function canonicalizeCityWithCountry(
  rawPieces: string[]
): { city: string; country: CountryCode } | null {
  const allPieces = rawPieces.flatMap(splitIntoPieces);

  for (const piece of allPieces) {
    const known = resolveKnownCity(normalizeForFingerprint(piece));
    if (known) return { city: known, country: CITIES[known].country };
  }

  let country: CountryCode | null = null;
  for (const piece of allPieces) {
    const found = COUNTRY_NAME_ALIASES[normalizeForFingerprint(piece)];
    if (found) {
      country = found;
      break;
    }
  }
  if (!country) return null;

  for (const piece of allPieces) {
    if (COUNTRY_NAME_ALIASES[normalizeForFingerprint(piece)]) continue;
    if (looksLikePlaceName(piece)) return { city: titleCase(piece), country };
  }

  return { city: OTHER_CITY, country };
}

export function matchSpecialty(title: string): SpecialtyId | null {
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
