"use client";

import { useState } from "react";
import { COUNTRIES, type CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

// Sits above the globe (2026-09-27): pick a country and the globe flies
// there before opening its page (see GlobeView#flyToCountry).
export function GlobeCountrySearch({ onSelect }: { onSelect: (country: CountryCode) => void }) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = query.trim()
    ? COUNTRIES.filter((c) => c.name[locale].toLowerCase().includes(query.trim().toLowerCase()))
    : COUNTRIES;

  function select(code: CountryCode) {
    setQuery("");
    setOpen(false);
    onSelect(code);
  }

  return (
    <div className="relative mx-auto mb-4 w-full max-w-xs">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={t(locale, "search_country")}
        className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent-amber/50"
      />
      {open && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-panel shadow-lg">
          {matches.length === 0 ? (
            <p className="px-4 py-2 text-sm text-muted">{t(locale, "no_country_found")}</p>
          ) : (
            matches.map((c) => (
              <button
                key={c.code}
                type="button"
                onMouseDown={() => select(c.code)}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-border/50"
              >
                {c.name[locale]}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
