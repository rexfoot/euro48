import type { Offer } from "./offers";
import type { CountryCode, Locale } from "./constants";
import { COUNTRIES, OTHER_CITY, URGENT_KEYWORDS } from "./constants";

export function titleFor(offer: Offer, locale: Locale): string {
  if (locale === "fr") return offer.title_fr || offer.title_original;
  if (locale === "es") return offer.title_es || offer.title_original;
  return offer.title_en || offer.title_original;
}

// City is stored the same way regardless of locale (e.g. "Oskarshamn") —
// only the "no city given" bucket falls back to the country name instead
// (spec 2026-09-27: never show the literal "Other" bucket to a user).
export function cityLabel(city: string, locale: Locale, countryCode: CountryCode): string {
  if (city !== OTHER_CITY) return city;
  return COUNTRIES.find((c) => c.code === countryCode)?.name[locale] ?? countryCode;
}

export function hoursSince(publishedAt: string): number {
  return (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
}

export function ageBadge(publishedAt: string): "new" | "today" | null {
  const h = hoursSince(publishedAt);
  if (h < 2) return "new";
  if (h < 24) return "today";
  return null;
}

export function isUrgentOffer(offer: Offer): boolean {
  const h = hoursSince(offer.published_at);
  if (h >= 24) return false;
  const haystack = `${offer.title_original} ${offer.title_fr} ${offer.title_es} ${offer.title_en}`.toLowerCase();
  return URGENT_KEYWORDS.some((kw) => haystack.includes(kw));
}

export function minutesOrHoursAgo(publishedAt: string): { unit: "minutes_ago" | "hours_ago"; n: number } {
  const h = hoursSince(publishedAt);
  if (h < 1) return { unit: "minutes_ago", n: Math.max(1, Math.round(h * 60)) };
  return { unit: "hours_ago", n: Math.round(h) };
}
