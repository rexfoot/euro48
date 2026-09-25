"use client";

import Link from "next/link";
import { SPECIALTIES, type CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";

export function SpecialtyGrid({
  country,
  city,
  counts,
}: {
  country: CountryCode;
  city: string;
  counts: Record<string, number>;
}) {
  const { locale } = useLocale();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SPECIALTIES.map((specialty) => {
        const count = counts[specialty.id] ?? 0;
        return (
          <Link
            key={specialty.id}
            href={`/${country.toLowerCase()}/${encodeURIComponent(city)}/${specialty.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-panel px-4 py-3 transition-colors hover:border-accent-amber/50"
          >
            <span className="text-sm font-medium">{specialty.name[locale]}</span>
            <span className="text-xs text-accent-amber">{count > 0 ? `+${count}` : "—"}</span>
          </Link>
        );
      })}
    </div>
  );
}
