import { COUNTRY_CODES, type CountryCode } from "./constants";

// Housing + furniture affiliate links shown on each country page. Same
// links for every country for now (affiliate program is EU/global) — kept
// per-country so any of them can be swapped individually later without
// touching the component (spec 2026-09-28).
const DEFAULT_HOUSING_URL = "https://www.booking.com";
const DEFAULT_FURNITURE_URL = "https://www.amazon.fr/s?k=meubles+maison&tag=euro48-21";

export const AFFILIATE_LINKS: Record<CountryCode, { housingUrl: string; furnitureUrl: string }> =
  Object.fromEntries(
    COUNTRY_CODES.map((code) => [
      code,
      { housingUrl: DEFAULT_HOUSING_URL, furnitureUrl: DEFAULT_FURNITURE_URL },
    ])
  ) as Record<CountryCode, { housingUrl: string; furnitureUrl: string }>;
