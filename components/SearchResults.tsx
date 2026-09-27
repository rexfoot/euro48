"use client";

import type { Offer } from "@/lib/offers";
import { SPECIALTIES, type SpecialtyId } from "@/lib/constants";
import { OfferCard } from "./OfferCard";
import { EmptyState } from "./EmptyState";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function SearchResults({
  offers,
  query,
  specialty,
}: {
  offers: Offer[];
  query: string;
  specialty?: SpecialtyId;
}) {
  const { locale } = useLocale();
  const specialtyName = specialty ? SPECIALTIES.find((s) => s.id === specialty)?.name[locale] : undefined;
  const label = query || specialtyName;

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-muted">
        {label ? t(locale, "search_results_for", { q: label, n: offers.length }) : t(locale, "search_results_count", { n: offers.length })}
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
