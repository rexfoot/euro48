import { SITE_URL, COUNTRIES, OTHER_CITY, SPECIALTIES, type CountryCode, type SpecialtyId } from "./constants";
import type { Offer } from "./offers";
import { titleFor } from "./offer-display";

// The site has no per-language URLs (locale is a client-side toggle, see
// LocaleProvider) — every page is a single URL serving all 3 languages.
// Google explicitly supports hreflang pointing at the same URL for sites
// that serve languages this way, so every entry below self-references.
function hreflangLanguages(path: string) {
  const url = `${SITE_URL}${path}`;
  return { fr: url, es: url, en: url, "x-default": url };
}

// For a page's `export const metadata` / `generateMetadata`.
export function pageAlternates(path: string) {
  return {
    canonical: `${SITE_URL}${path}`,
    languages: hreflangLanguages(path),
  };
}

// For an entry in app/sitemap.ts (MetadataRoute.Sitemap nests differently:
// no top-level `canonical`, `languages` goes under `alternates`).
export function sitemapAlternates(path: string) {
  return { languages: hreflangLanguages(path) };
}

export function countryNameFr(code: CountryCode): string {
  return COUNTRIES.find((c) => c.code === code)?.name.fr ?? code;
}

export function specialtyNameFr(id: SpecialtyId): string {
  return SPECIALTIES.find((s) => s.id === id)?.name.fr ?? id;
}

const SOURCE_LABELS: Record<string, string> = {
  eures: "EURES",
  adzuna: "Adzuna",
  arbeitnow: "Arbeitnow",
  bundesagentur: "Bundesagentur für Arbeit",
  jobtech: "Arbetsförmedlingen",
  nav: "NAV",
};

// JobPosting (schema.org) structured data for one offer. Returns null when
// we don't have the minimum real fields Google requires — we never
// fabricate a company name, and a real jobLocation is one of them, so an
// offer filed under "Other" (no location text at all) skips this too.
export function jobPostingJsonLd(offer: Offer) {
  if (!offer.company || offer.company === "—") return null;
  if (offer.city === OTHER_CITY) return null;

  const url = `${SITE_URL}/job/${encodeURIComponent(offer.id)}`;
  const title = titleFor(offer, "fr");
  const country = countryNameFr(offer.country_code as CountryCode);
  const specialty = specialtyNameFr(offer.specialty as SpecialtyId);
  const sourceLabel = SOURCE_LABELS[offer.source] ?? offer.source;
  const validThrough = new Date(new Date(offer.published_at).getTime() + 72 * 3_600_000).toISOString();

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description: `${specialty} chez ${offer.company} à ${offer.city}, ${country}. Offre publiée via ${sourceLabel} sur Euro48.`,
    identifier: { "@type": "PropertyValue", name: "euro48", value: offer.id },
    datePosted: new Date(offer.published_at).toISOString(),
    validThrough,
    hiringOrganization: { "@type": "Organization", name: offer.company },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: offer.city,
        addressCountry: offer.country_code,
      },
    },
    url,
  };

  if (offer.remote) jsonLd.jobLocationType = "TELECOMMUTE";

  return jsonLd;
}
