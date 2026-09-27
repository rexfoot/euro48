"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

// Home page only (spec 2026-09-27): a big "Recevoir les alertes" CTA +
// country + submit (sticky on scroll), then a separate job-keyword box
// further down, in the spot the old "Chercher un pays…" country-name
// search used to sit, right above the map — both fields submit together
// to /search even though they're not next to each other on the page.
// Focusing the keyword box empty shows the list of métiers to pick from
// directly, no typing required — picking one fills the box with its name
// and waits for "Chercher" (spec 2026-09-27: pick, then press Chercher,
// not an immediate jump).
export function HomeSearch() {
  const router = useRouter();
  const { locale } = useLocale();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyId | "">("");
  const [showSpecialties, setShowSpecialties] = useState(false);

  function onQChange(value: string) {
    setQ(value);
    setSelectedSpecialty(""); // free typing overrides a pill pick
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
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col items-center gap-3">
      <div className="sticky top-0 z-30 flex w-full flex-col gap-2 bg-background/95 py-2 backdrop-blur-sm sm:flex-row md:static md:bg-transparent md:py-0 md:backdrop-blur-none">
        <Link
          href="/alerts"
          className="flex w-full flex-1 items-center justify-center rounded-xl bg-accent-orange px-4 py-3 text-base font-semibold text-white shadow-[0_2px_10px_rgba(251,122,36,0.35)] transition-opacity hover:opacity-90"
        >
          {t(locale, "see_all_alerts")}
        </Link>
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

      <div className="relative w-full">
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
    </form>
  );
}
