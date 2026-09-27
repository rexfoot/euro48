"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function SearchBar({
  defaultQuery = "",
  defaultCountry,
  hideKeyword = false,
}: {
  defaultQuery?: string;
  defaultCountry?: CountryCode;
  // Home page (2026-09-27): the keyword box is replaced by a same-size
  // "Recevoir les alertes" CTA instead — the /search results page keeps
  // the real keyword input to refine a search.
  hideKeyword?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [q, setQ] = useState(defaultQuery);
  const [country, setCountry] = useState<CountryCode | "">(defaultCountry ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (country) params.set("country", country);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
      {hideKeyword ? (
        <Link
          href="/alerts"
          className="flex w-full flex-1 items-center justify-center rounded-xl bg-accent-orange px-4 py-3 text-base font-semibold text-white shadow-[0_2px_10px_rgba(251,122,36,0.35)] transition-opacity hover:opacity-90"
        >
          {t(locale, "see_all_alerts")}
        </Link>
      ) : (
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(locale, "search_placeholder")}
          className="w-full flex-1 rounded-xl border border-border bg-panel px-4 py-3 text-base outline-none focus:border-accent-amber/50"
        />
      )}
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
    </form>
  );
}
