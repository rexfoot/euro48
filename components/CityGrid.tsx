"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OTHER_CITY, type CountryCode } from "@/lib/constants";
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
      <span className="text-sm font-medium">{cityLabel(city, locale, country)}</span>
      <span className="text-xs text-accent-amber">{count > 0 ? `+${count}` : "—"}</span>
    </Link>
  );
}

// Search is always visible, up front — it finds ANY real city in the
// country (GeoNames-backed, ~44k towns across our 15 countries), even
// with zero offers right now, so e.g. "Mulhouse" is always findable.
// Below it: cities with offers first (busiest up front, spec: never look
// empty) when there's no active search.
export function CityGrid({ country, counts }: { country: CountryCode; counts: Record<string, number> }) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[] | null>(null);

  // The "no city given" bucket is never a pickable city — those offers
  // still show up via the country's own aggregate count, just not here.
  const top = Object.entries(counts)
    .filter(([city]) => city !== OTHER_CITY)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_N);
  const searching = query.trim().length >= 2;

  useEffect(() => {
    if (!searching) {
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
  }, [query, country, searching]);

  return (
    <div>
      <label className="mb-2 block text-base font-semibold sm:text-lg">{t(locale, "city_search_label")}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t(locale, "search_city")}
        className="mb-5 w-full rounded-xl border border-border bg-panel px-4 py-3 text-base outline-none focus:border-accent-amber/50"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {(searching ? results ?? [] : top.map(([city]) => city)).map((city) => (
          <CityLink key={city} country={country} city={city} count={counts[city] ?? 0} locale={locale} />
        ))}
      </div>
    </div>
  );
}
