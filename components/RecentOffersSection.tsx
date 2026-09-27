"use client";

import Link from "next/link";
import type { Offer } from "@/lib/offers";
import { OfferCard } from "./OfferCard";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

// Mobile home only (spec 2026-09-27, block C, section 5): a ticker you
// can't comfortably tap mid-scroll is no substitute for an actual
// clickable list, so phones get this instead — desktop keeps the ticker.
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
      <Link
        href="/alerts"
        className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-border bg-panel px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent-amber/50"
      >
        {t(locale, "see_all_alerts")}
      </Link>
    </section>
  );
}
