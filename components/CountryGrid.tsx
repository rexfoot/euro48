"use client";

import Link from "next/link";
import { COUNTRIES, countryBadgeKeys, type CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function CountryGrid({ counts }: { counts: Record<CountryCode, number> }) {
  const { locale } = useLocale();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {COUNTRIES.map((country) => {
        const count = counts[country.code] ?? 0;
        const badges = countryBadgeKeys(country.code).map((k) => t(locale, k));

        return (
          <Link
            key={country.code}
            href={`/${country.code.toLowerCase()}`}
            className={`flex flex-col gap-1 rounded-xl border border-border bg-panel p-3 transition-colors hover:border-accent-amber/50 ${count === 0 ? "opacity-50" : ""}`}
          >
            <img
              src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
              alt={country.name[locale]}
              width={24}
              height={18}
              className="rounded-sm"
            />
            <span className="text-sm font-medium">{country.name[locale]}</span>
            <span className="text-xs text-accent-amber">{count > 0 ? `+${count}` : "—"}</span>
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {badges.map((b) => (
                  <span key={b} className="rounded-full bg-border px-1.5 py-0.5 text-[10px] text-muted">
                    {b}
                  </span>
                ))}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
