"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { gulfCountryName } from "@/lib/gulf-constants";
import type { GulfOfferRow } from "@/lib/gulf-offers";

export function GulfOfferCard({ offer }: { offer: GulfOfferRow }) {
  const { locale } = useLocale();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <h3 className="font-medium leading-snug">{offer.title_original}</h3>
      <p className="text-sm text-muted">
        {offer.company} · {offer.city} · {gulfCountryName(offer.country_code, locale)}
      </p>
      <a
        href={offer.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-accent-amber px-3 py-1.5 text-sm font-medium text-[#070B14] transition-opacity hover:opacity-90"
      >
        {t(locale, "see_offer")}
      </a>
    </div>
  );
}
