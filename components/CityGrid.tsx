"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { cityLabel } from "@/lib/offer-display";

const TOP_N = 8;

function CityLink({
  country, city, count, locale,
}: { country: CountryCode; city: string; count: number; locale: ReturnType<typeof useLocale>["locale"] }) {
  return (
    <Link
      href={`/${country.toLowerCase()}/${encodeURIComponent(city)}`}
      className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 transition-colors hover:border-accent-amber/50"
    >
      <span className="text-sm font-medium">{cityLabel(city, locale)}</span>
      <span className="text-xs text-accent-amber">{count > 0 ? `+${count}` : "—"}</span>
    </Link>
  );
}

// Cities with offers are shown first (busiest up front, spec: never look
// empty); the search below finds ANY real city in the country — GeoNames-
// backed, ~44k towns across our 15 countries — even with zero offers
// right now, so a search for e.g. "Mulhouse" always finds it.
export function CityGrid({ country, counts }: { country: CountryCode; counts: Record<string, number> }) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[] | null>(null);

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, TOP_N);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/cities?country=${country}&q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setResults(data.results ?? []))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, country]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {top.map(([city, count]) => (
          <CityLink key={city} country={country} city={city} count={count} locale={locale} />
        ))}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-muted hover:text-foreground">
          {t(locale, "all_cities")}
        </summary>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(locale, "search_city")}
          className="mt-3 mb-3 w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50"
        />
        {results !== null && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {results.map((city) => (
              <CityLink key={city} country={country} city={city} count={counts[city] ?? 0} locale={locale} />
            ))}
          </div>
        )}
      </details>
    </div>
  );
}
