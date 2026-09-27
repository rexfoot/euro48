import type { Metadata } from "next";
import { COUNTRY_CODES, type CountryCode } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { BackLink } from "@/components/Localized";
import { pageAlternates } from "@/lib/seo";

export const revalidate = 0;

type Props = { searchParams: Promise<{ q?: string; country?: string }> };

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

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ, country: rawCountry } = await searchParams;
  const q = (rawQ ?? "").trim();
  const country = resolveCountry(rawCountry);

  const offers = q || country ? await getVisibleOffers({ q: q || undefined, country, limit: 200 }) : [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <BackLink href="/" />
      <h1 className="sr-only">{q ? `${q} — Euro48` : "Recherche — Euro48"}</h1>
      <div className="mt-4">
        <SearchBar defaultQuery={q} defaultCountry={country} />
      </div>
      <SearchResults offers={offers} query={q} />
    </main>
  );
}
