import type { Metadata } from "next";
import { getVisibleOffers } from "@/lib/offers";
import { countsByCountry } from "@/lib/aggregate";
import { Ticker } from "@/components/Ticker";
import { AnalogClock } from "@/components/AnalogClock";
import { Counter } from "@/components/Counter";
import { CountryGrid } from "@/components/CountryGrid";
import { HomeSearch } from "@/components/HomeSearch";
import { RecentOffersSection } from "@/components/RecentOffersSection";
import { pageAlternates } from "@/lib/seo";

// `absolute` bypasses the root layout's "%s | Euro48" template (this title
// already carries its own "Euro48 —" branding) — static, not per-visitor
// language: the site has one URL for fr/es/en (see lib/seo.ts), so Google
// can only ever be given one title/description for it (spec 2026-09-27).
export const metadata: Metadata = {
  title: { absolute: "Euro48 — Fresh jobs in Europe from the last 48 hours" },
  description:
    "Find your next job before everyone else. Only jobs posted in the last 48h across Europe. No old listings, no duplicates. Email & Telegram alerts.",
  alternates: pageAlternates("/"),
};

export const revalidate = 60;

const RECENT_OFFERS_COUNT = 10;

export default async function Home() {
  const offers = await getVisibleOffers({ limit: 500 });
  const countryCounts = countsByCountry(offers);

  return (
    <main className="flex flex-1 flex-col">
      <Ticker offers={offers.slice(0, 30)} />

      <section className="flex flex-col items-center gap-4 px-4 py-8 text-center">
        <Counter count={offers.length} />
        <HomeSearch />
        <AnalogClock />
      </section>

      <section className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12">
        <CountryGrid counts={countryCounts} />
      </section>

      <RecentOffersSection offers={offers.slice(0, RECENT_OFFERS_COUNT)} />
    </main>
  );
}
