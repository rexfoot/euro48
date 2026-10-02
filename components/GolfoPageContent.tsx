"use client";

import { GulfOfferCard } from "./GulfOfferCard";
import { RadarToggle } from "./RadarToggle";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import type { GulfOfferRow } from "@/lib/gulf-offers";

export function GolfoPageContent({ offers }: { offers: GulfOfferRow[] }) {
  const { locale } = useLocale();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">{t(locale, "golfo_title")}</h1>

      <div className="mt-3 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4 text-sm text-accent-amber">
        {t(locale, "golfo_disclaimer")}
      </div>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-accent-amber">+{offers.length}</span> {t(locale, "golfo_count_suffix")}
      </p>

      <div className="mt-6">
        <RadarToggle />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {offers.length === 0 ? (
          <p className="text-sm text-muted">{t(locale, "golfo_no_offers")}</p>
        ) : (
          offers.map((offer) => <GulfOfferCard key={offer.id} offer={offer} />)
        )}
      </div>
    </main>
  );
}
