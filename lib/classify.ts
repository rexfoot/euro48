// Shared city/specialty matching, reused by every source module so all of
// them enforce the same closed lists (spec section 12 "INTERDIT").

import { CITIES, SPECIALTIES, type CityName, type CountryCode, type SpecialtyId } from "./constants";
import { normalizeForFingerprint } from "./fingerprint";

// Native-language / alternate spellings that differ from our (English)
// CITIES keys by more than accents — sources often return these, and
// without this table those offers were silently dropped for "unknown
// city" even though the city is on our closed list (diagnosed 2026-09-26:
// this was the single biggest reason whole countries showed near-zero
// offers, e.g. EURES returning "GÖTEBORG" which never matched "Gothenburg").
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

function resolveCityName(normalizedCandidate: string): CityName | null {
  for (const cityName of Object.keys(CITIES) as CityName[]) {
    if (normalizeForFingerprint(cityName) === normalizedCandidate) return cityName;
  }
  return CITY_ALIASES[normalizedCandidate] ?? null;
}

// Splits a raw location string into every plausible place-name piece —
// sources format this wildly differently, from "City, Region" to a full
// multi-line address block (seen from EURES for Ireland). Try them all
// instead of just the first segment, since the real city can be anywhere.
function splitIntoPieces(raw: string): string[] {
  return raw
    .split(/[,/()\n]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// Tries every candidate raw place name against the closed city list for
// the given country. Returns the first match.
export function matchCityFromCandidates(candidates: string[], country: CountryCode): string | null {
  for (const raw of candidates) {
    for (const piece of splitIntoPieces(raw)) {
      const cityName = resolveCityName(normalizeForFingerprint(piece));
      if (cityName && CITIES[cityName].country === country) return cityName;
    }
  }
  return null;
}

export function matchCity(rawCityName: string, country: CountryCode): string | null {
  return matchCityFromCandidates([rawCityName], country);
}

// For sources that don't tell us the country (e.g. Arbeitnow): tries every
// piece against the closed city list across all 15 countries. Safe by
// construction — only ever returns a listed city/country.
export function matchAnyCity(parts: string[]): { city: CityName; country: CountryCode } | null {
  for (const raw of parts) {
    for (const piece of splitIntoPieces(raw)) {
      const cityName = resolveCityName(normalizeForFingerprint(piece));
      if (cityName) return { city: cityName, country: CITIES[cityName].country };
    }
  }
  return null;
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
