"use client";

import type { Offer } from "@/lib/offers";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { titleFor, ageBadge, isUrgentOffer, minutesOrHoursAgo, cityLabel } from "@/lib/offer-display";

export function OfferCard({ offer }: { offer: Offer }) {
  const { locale } = useLocale();
  const badge = ageBadge(offer.published_at);
  const urgent = isUrgentOffer(offer);
  const ago = minutesOrHoursAgo(offer.published_at);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex items-center gap-2 text-xs">
        {urgent && (
          <span className="rounded-full bg-accent-red/20 px-2 py-0.5 font-semibold text-accent-red">
            {t(locale, "urgent_badge")}
          </span>
        )}
        {!urgent && badge === "new" && (
          <span className="rounded-full bg-accent-amber/20 px-2 py-0.5 font-semibold text-accent-amber">
            {t(locale, "new_badge")}
          </span>
        )}
        {!urgent && badge === "today" && (
          <span className="rounded-full bg-border px-2 py-0.5 font-semibold text-muted">
            {t(locale, "today_badge")}
          </span>
        )}
        <span className="text-muted">{t(locale, ago.unit, { n: ago.n })}</span>
      </div>
      <h3 className="font-medium leading-snug">{titleFor(offer, locale)}</h3>
      <p className="text-sm text-muted">
        {offer.company} · {cityLabel(offer.city, locale)} · {offer.country_code}
      </p>
      <p className="text-xs text-muted/70">{t(locale, "ad_language", { lang: offer.language_of_ad.toUpperCase() })}</p>
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
