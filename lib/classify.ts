// Shared city/specialty matching, reused by every source module so all of
// them enforce the same closed lists (spec section 12 "INTERDIT").

import { CITIES, SPECIALTIES, type CityName, type CountryCode, type SpecialtyId } from "./constants";
import { normalizeForFingerprint } from "./fingerprint";

// Tries each candidate raw place name (most specific first) against the
// closed city list for the given country. Returns the first match.
export function matchCityFromCandidates(candidates: string[], country: CountryCode): string | null {
  for (const raw of candidates) {
    const candidate = raw.split(/[,/(]/)[0].trim();
    if (!candidate) continue;
    const normalizedCandidate = normalizeForFingerprint(candidate);

    for (const cityName of Object.keys(CITIES) as (keyof typeof CITIES)[]) {
      if (CITIES[cityName].country !== country) continue;
      if (normalizeForFingerprint(cityName) === normalizedCandidate) return cityName;
    }
  }
  return null;
}

export function matchCity(rawCityName: string, country: CountryCode): string | null {
  return matchCityFromCandidates([rawCityName], country);
}

// For sources that don't tell us the country (e.g. Arbeitnow): tries each
// already-split location part against the closed city list across all 15
// countries. Safe by construction — only ever returns a listed city/country.
export function matchAnyCity(parts: string[]): { city: CityName; country: CountryCode } | null {
  for (const raw of parts) {
    const candidate = raw.trim();
    if (!candidate) continue;
    const normalizedCandidate = normalizeForFingerprint(candidate);

    for (const cityName of Object.keys(CITIES) as CityName[]) {
      if (normalizeForFingerprint(cityName) === normalizedCandidate) {
        return { city: cityName, country: CITIES[cityName].country };
      }
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
