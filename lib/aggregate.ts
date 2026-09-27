import type { Offer } from "./offers";
import { COUNTRY_CODES, OTHER_CITY, type CountryCode } from "./constants";

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

// City picker for the search page (spec 2026-09-27): only real cities that
// actually have an offer right now, grouped per country, busiest first.
// "Other" (no city given) is never a pickable city, same as CityGrid.
export function citiesWithOffersByCountry(offers: Offer[]): Partial<Record<CountryCode, { city: string; count: number }[]>> {
  const counts: Partial<Record<CountryCode, Record<string, number>>> = {};
  for (const offer of offers) {
    if (offer.city === OTHER_CITY) continue;
    const perCity = (counts[offer.country_code] ??= {});
    perCity[offer.city] = (perCity[offer.city] ?? 0) + 1;
  }

  const result: Partial<Record<CountryCode, { city: string; count: number }[]>> = {};
  for (const code of COUNTRY_CODES) {
    const perCity = counts[code];
    if (!perCity) continue;
    result[code] = Object.entries(perCity)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }
  return result;
}
