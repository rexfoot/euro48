"use client";

import { useState } from "react";
import Link from "next/link";
import type { CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { cityLabel } from "@/lib/offer-display";

const TOP_N = 8;

function CityLink({ country, city, count, locale }: { country: CountryCode; city: string; count: number; locale: ReturnType<typeof useLocale>["locale"] }) {
  return (
    <Link
      href={`/${country.toLowerCase()}/${encodeURIComponent(city)}`}
      className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 transition-colors hover:border-accent-amber/50"
    >
      <span className="text-sm font-medium">{cityLabel(city, locale)}</span>
      <span className="text-xs text-accent-amber">+{count}</span>
    </Link>
  );
}

// Cities are open now — there can be dozens with live offers, so we show
// the busiest ones up front and tuck the rest behind a search instead of
// dumping every city (sorted or not) into one long grid.
export function CityGrid({ country, counts }: { country: CountryCode; counts: Record<string, number> }) {
  const { locale } = useLocale();
  const [filter, setFilter] = useState("");

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N).sort((a, b) => a[0].localeCompare(b[0]));
  const filteredRest = filter
    ? rest.filter(([city]) => cityLabel(city, locale).toLowerCase().includes(filter.toLowerCase()))
    : rest;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {top.map(([city, count]) => (
          <CityLink key={city} country={country} city={city} count={count} locale={locale} />
        ))}
      </div>

      {rest.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted hover:text-foreground">
            {t(locale, "all_cities")} ({rest.length})
          </summary>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t(locale, "search_city")}
            className="mt-3 mb-3 w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filteredRest.map(([city, count]) => (
              <CityLink key={city} country={country} city={city} count={count} locale={locale} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
