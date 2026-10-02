// Closed list for the separate "Golfo" section (2026-10-02) — rich Gulf
// countries, explicitly NOT part of COUNTRIES/CITIES in lib/constants.ts.
// Kept in its own file on purpose: COUNTRIES feeds the globe, sitemap,
// country pages, search, alerts and the DB's offers_country_code_allowed
// check constraint — all scoped to Europe per spec section 12. Mixing Gulf
// codes into that list would silently change those existing EU features.
// This section has its own table (gulf_offers) and its own small set of
// pages/routes instead.

export const GULF_COUNTRIES = [
  { code: "AE", name: { fr: "Émirats arabes unis", es: "Emiratos Árabes Unidos", en: "United Arab Emirates" }, joobleLocation: "United Arab Emirates" },
  { code: "SA", name: { fr: "Arabie saoudite", es: "Arabia Saudí", en: "Saudi Arabia" }, joobleLocation: "Saudi Arabia" },
  { code: "QA", name: { fr: "Qatar", es: "Catar", en: "Qatar" }, joobleLocation: "Qatar" },
  { code: "KW", name: { fr: "Koweït", es: "Kuwait", en: "Kuwait" }, joobleLocation: "Kuwait" },
  { code: "BH", name: { fr: "Bahreïn", es: "Baréin", en: "Bahrain" }, joobleLocation: "Bahrain" },
  { code: "OM", name: { fr: "Oman", es: "Omán", en: "Oman" }, joobleLocation: "Oman" },
] as const;

export type GulfCountryCode = (typeof GULF_COUNTRIES)[number]["code"];

export const GULF_COUNTRY_CODES = GULF_COUNTRIES.map((c) => c.code) as GulfCountryCode[];

export function gulfCountryName(code: string, locale: "fr" | "es" | "en"): string {
  return GULF_COUNTRIES.find((c) => c.code === code)?.name[locale] ?? code;
}
