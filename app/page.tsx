import { getVisibleOffers } from "@/lib/offers";
import { countsByCountry } from "@/lib/aggregate";
import { Ticker } from "@/components/Ticker";
import { AnalogClock } from "@/components/AnalogClock";
import { Counter } from "@/components/Counter";
import { CountryGrid } from "@/components/CountryGrid";
import { HomeSearch } from "@/components/HomeSearch";
import { RecentOffersSection } from "@/components/RecentOffersSection";

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
