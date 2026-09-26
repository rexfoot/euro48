// Shared city/specialty matching, reused by every source module so all of
// them enforce the same closed lists (spec section 12 "INTERDIT").

import { CITIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "./constants";
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
