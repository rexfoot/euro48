"use client";

import type { Offer } from "@/lib/offers";
import { OfferCard } from "./OfferCard";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

// Mobile home only (spec 2026-09-27, block C, section 5): a plain
// scrollable list of recent offers, in addition to the ticker at the top
// (also on mobile since 2026-09-27, slowed down to stay tappable there).
// The trailing "Recevoir les alertes" link was removed 2026-09-27 — the
// orange CTA up in HomeSearch is the only one now.
export function RecentOffersSection({ offers }: { offers: Offer[] }) {
  const { locale } = useLocale();

  return (
    <section className="mx-auto w-full max-w-lg px-4 pb-12 md:hidden">
      <h2 className="mb-3 text-sm font-medium text-muted">{t(locale, "recent_offers")}</h2>
      <div className="flex flex-col gap-3">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
