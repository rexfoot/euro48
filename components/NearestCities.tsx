"use client";

import Link from "next/link";
import type { CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { cityLabel } from "@/lib/offer-display";

export type NearbyCity = { city: string; count: number; distanceKm: number };

// Shown instead of the specialty grid when a city has zero offers in the
// last 48h — real distance (haversine over GeoNames coordinates), not a
// guess, to the closest cities that do have something right now.
export function NearestCities({ country, cities }: { country: CountryCode; cities: NearbyCity[] }) {
  const { locale } = useLocale();

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-12 text-center">
      <p className="text-muted">{t(locale, "no_offers_city")}</p>

      {cities.length > 0 && (
        <div className="flex w-full flex-col gap-2 px-6 sm:max-w-sm">
          <p className="text-sm font-medium text-muted">{t(locale, "nearby_cities")}</p>
          {cities.map((c) => (
            <Link
              key={c.city}
              href={`/${country.toLowerCase()}/${encodeURIComponent(c.city)}`}
              className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 transition-colors hover:border-accent-amber/50"
            >
              <span className="text-sm font-medium">{cityLabel(c.city, locale)}</span>
              <span className="text-xs text-muted">
                {t(locale, "km_away", { n: Math.round(c.distanceKm) })} · <span className="text-accent-amber">+{c.count}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
