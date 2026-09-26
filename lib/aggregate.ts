import type { Offer } from "./offers";
import { COUNTRY_CODES, type CountryCode } from "./constants";

// Cities are open: this simply counts whatever city each currently visible
// offer has — a city with zero offers just never appears here, which is
// exactly what should happen (never list an empty city).
export function countsByCity(offers: Offer[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const offer of offers) {
    counts[offer.city] = (counts[offer.city] ?? 0) + 1;
  }
  return counts;
}

export function countsByCountry(offers: Offer[]): Record<CountryCode, number> {
  const counts = Object.fromEntries(COUNTRY_CODES.map((c) => [c, 0])) as Record<CountryCode, number>;
  for (const offer of offers) {
    if (offer.country_code in counts) counts[offer.country_code]++;
  }
  return counts;
}

export function countsBySpecialty(offers: Offer[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const offer of offers) {
    counts[offer.specialty] = (counts[offer.specialty] ?? 0) + 1;
  }
  return counts;
}
