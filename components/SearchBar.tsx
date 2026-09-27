"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

// Used on the /search results page — the home page has its own HomeSearch
// component instead (spec 2026-09-27). Job/Country/City, with the job box
// showing métier suggestions on focus, same pattern as HomeSearch.
export function SearchBar({
  defaultQuery = "",
  defaultCountry,
  defaultCity = "",
}: {
  defaultQuery?: string;
  defaultCountry?: CountryCode;
  defaultCity?: string;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [q, setQ] = useState(defaultQuery);
  const [country, setCountry] = useState<CountryCode | "">(defaultCountry ?? "");
  const [city, setCity] = useState(defaultCity);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyId | "">("");
  const [showSpecialties, setShowSpecialties] = useState(false);

  function onQChange(value: string) {
    setQ(value);
    setSelectedSpecialty("");
  }

  function pickSpecialty(id: SpecialtyId, name: string) {
    setSelectedSpecialty(id);
    setQ(name);
    setShowSpecialties(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedSpecialty) params.set("specialty", selectedSpecialty);
    else if (q.trim()) params.set("q", q.trim());
    if (country) params.set("country", country);
    if (city.trim()) params.set("city", city.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-2">
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <div className="relative w-full flex-1">
          <input
            type="text"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            onFocus={() => setShowSpecialties(true)}
            onBlur={() => setTimeout(() => setShowSpecialties(false), 150)}
            placeholder={t(locale, "search_offer_placeholder")}
            className="w-full rounded-xl border-2 border-accent-blue bg-panel px-4 py-3 text-base text-foreground shadow-[0_0_0_3px_rgba(47,143,255,0.15)] outline-none placeholder:text-accent-blue/70 focus:shadow-[0_0_0_4px_rgba(47,143,255,0.25)]"
          />
          {showSpecialties && q.trim() === "" && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border border-accent-blue/40 bg-panel p-2 shadow-lg">
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onMouseDown={() => pickSpecialty(s.id, s.name[locale])}
                    className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-accent-blue hover:text-accent-blue"
                  >
                    {s.name[locale]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as CountryCode | "")}
          className="rounded-xl border border-border bg-panel px-3 py-3 text-sm outline-none focus:border-accent-amber/50 sm:w-44"
        >
          <option value="">{t(locale, "all_countries")}</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name[locale]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-accent-amber px-5 py-3 text-sm font-semibold text-background"
        >
          {t(locale, "search_button")}
        </button>
      </div>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={t(locale, "search_city")}
        className="w-full rounded-xl border border-border bg-panel px-4 py-3 text-base outline-none focus:border-accent-amber/50 sm:max-w-xs"
      />
    </form>
  );
}
