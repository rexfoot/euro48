"use client";

import type { Offer } from "@/lib/offers";
import { OfferCard } from "./OfferCard";
import { EmptyState } from "./EmptyState";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function SearchResults({ offers, query }: { offers: Offer[]; query: string }) {
  const { locale } = useLocale();

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-muted">
        {query ? t(locale, "search_results_for", { q: query, n: offers.length }) : t(locale, "search_results_count", { n: offers.length })}
      </p>
      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
