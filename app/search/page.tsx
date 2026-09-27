import type { Metadata } from "next";
import { COUNTRY_CODES, MAX_VISIBLE_OFFERS, SPECIALTY_IDS, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { citiesWithOffersByCountry } from "@/lib/aggregate";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { BackLink } from "@/components/Localized";
import { pageAlternates } from "@/lib/seo";

export const revalidate = 0;

type Props = { searchParams: Promise<{ q?: string; country?: string; specialty?: string; city?: string }> };

// Arbitrary query params, no evergreen content of its own — never indexed,
// never in the sitemap (spec 2026-09-27, block B).
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `${q} — Recherche` : "Recherche",
    robots: { index: false, follow: true },
    alternates: pageAlternates("/search"),
  };
}

function resolveCountry(country?: string): CountryCode | undefined {
  const code = country?.toUpperCase();
  return code && COUNTRY_CODES.includes(code as CountryCode) ? (code as CountryCode) : undefined;
}

function resolveSpecialty(specialty?: string): SpecialtyId | undefined {
  return specialty && SPECIALTY_IDS.includes(specialty as SpecialtyId) ? (specialty as SpecialtyId) : undefined;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ, country: rawCountry, specialty: rawSpecialty, city: rawCity } = await searchParams;
  const q = (rawQ ?? "").trim();
  const country = resolveCountry(rawCountry);
  const specialty = resolveSpecialty(rawSpecialty);
  const city = (rawCity ?? "").trim();

  // "Search Jobs" always shows what matches right now, last-48h, even with
  // every field left blank (spec 2026-09-27) — capped at 200 either way.
  // A second, unfiltered fetch (independent of the current search) feeds
  // the city picker below — "only cities that actually have offers now".
  const [offers, allOffers] = await Promise.all([
    getVisibleOffers({ q: q || undefined, country, specialty, city: city || undefined, limit: 200 }),
    getVisibleOffers({ limit: MAX_VISIBLE_OFFERS }),
  ]);
  const citiesByCountry = citiesWithOffersByCountry(allOffers);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <BackLink href="/" />
      <h1 className="sr-only">{q ? `${q} — Euro48` : "Recherche — Euro48"}</h1>
      <div className="mt-4">
        <SearchBar defaultQuery={q} defaultCountry={country} defaultCity={city} citiesByCountry={citiesByCountry} />
      </div>
      <SearchResults offers={offers} query={q} specialty={specialty} country={country} city={city || undefined} />
    </main>
  );
}
