"use client";

import { useState, useEffect } from "react";
import type { Offer } from "@/lib/offers";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { titleFor, ageBadge, isUrgentOffer, minutesOrHoursAgo, cityLabel } from "@/lib/offer-display";
import { ServicesModal } from "./ServicesModal";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function OfferCard({ offer }: { offer: Offer }) {
  const { locale } = useLocale();
  const badge = ageBadge(offer.published_at);
  const urgent = isUrgentOffer(offer);
  const ago = minutesOrHoursAgo(offer.published_at);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (offer.city_lat && offer.city_lng && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDistance(Math.round(haversineDistance(pos.coords.latitude, pos.coords.longitude, offer.city_lat!, offer.city_lng!)));
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, [offer.city_lat, offer.city_lng]);

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
        {offer.company} · {cityLabel(offer.city, locale, offer.country_code)} · {offer.country_code}
        {distance !== null && <span className="ml-2 text-accent-amber">· {distance.toLocaleString()} km</span>}
      </p>
      {offer.description && (
        <p className="whitespace-pre-wrap text-sm text-foreground">{offer.description}</p>
      )}
      <p className="text-xs text-muted/70">{t(locale, "ad_language", { lang: offer.language_of_ad.toUpperCase() })}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-amber px-3 py-1.5 text-sm font-medium text-[#070B14] transition-opacity hover:opacity-90"
        >
          {t(locale, "see_offer")}
        </a>
        <ServicesModal
          countryCode={offer.country_code}
          city={offer.city}
          cityLat={offer.city_lat}
          cityLng={offer.city_lng}
        />
      </div>
    </div>
  );
}
