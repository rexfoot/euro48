"use client";

import type { Offer } from "@/lib/offers";
import { SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { OfferCard } from "./OfferCard";
import { InlineAlertSignup } from "./InlineAlertSignup";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function SearchResults({
  offers,
  query,
  specialty,
  country,
  city,
}: {
  offers: Offer[];
  query: string;
  specialty?: SpecialtyId;
  country?: CountryCode;
  city?: string;
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
        <InlineAlertSignup query={query} specialty={specialty} country={country} city={city} />
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
