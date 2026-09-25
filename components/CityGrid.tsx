"use client";

import Link from "next/link";
import type { CountryCode } from "@/lib/constants";

export function CityGrid({
  country,
  cities,
  counts,
}: {
  country: CountryCode;
  cities: string[];
  counts: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {cities.map((city) => {
        const count = counts[city] ?? 0;
        return (
          <Link
            key={city}
            href={`/${country.toLowerCase()}/${encodeURIComponent(city)}`}
            className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 transition-colors hover:border-accent-amber/50"
          >
            <span className="text-sm font-medium">{city}</span>
            <span className="text-xs text-accent-amber">{count > 0 ? `+${count}` : "—"}</span>
          </Link>
        );
      })}
    </div>
  );
}
