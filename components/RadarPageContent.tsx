"use client";

import { RadarOfferCard } from "./RadarOfferCard";
import { RadarToggle } from "./RadarToggle";
import { RadarFilters } from "./RadarFilters";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import type { Offer } from "@/lib/offers";
import type { EligibilityStatus } from "@/lib/eligibility";

type RadarOffer = Offer & { status: EligibilityStatus; professionId: string | null };

export function RadarPageContent({ offers }: { offers: RadarOffer[] }) {
  const { locale } = useLocale();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">{t(locale, "radar_title")}</h1>

      <div className="mt-3 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4 text-sm text-accent-amber">
        {t(locale, "radar_disclaimer")}
      </div>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-accent-amber">+{offers.length}</span> {t(locale, "radar_count_suffix")}
      </p>

      <div className="mt-6">
        <RadarToggle />
      </div>

      <RadarFilters offers={offers} />

      <div className="mt-6 flex flex-col gap-3">
        {offers.length === 0 ? (
          <p className="text-sm text-muted">{t(locale, "radar_no_offers")}</p>
        ) : (
          offers.map(r => (
            <RadarOfferCard
              key={r.id}
              offer={r}
              status={r.status}
              professionId={r.professionId}
            />
          ))
        )}
      </div>
    </main>
  );
}
