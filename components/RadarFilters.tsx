"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import type { Offer } from "@/lib/offers";
import type { EligibilityStatus } from "@/lib/eligibility";

type RadarOffer = Offer & { status: EligibilityStatus; professionId: string | null };

const PROFESSION_IDS = [
  "carnicero", "panadero", "peluquero", "cocina", "construccion",
  "conductor", "mecanica", "limpieza", "agricultura", "hosteleria",
  "logistica", "cuidado",
] as const;

export function RadarFilters({ offers }: { offers: RadarOffer[] }) {
  const { locale } = useLocale();
  const [profession, setProfession] = useState("");
  const [country, setCountry] = useState("");
  const [badge, setBadge] = useState("");

  const filtered = offers
    .filter(r => !profession || r.professionId === profession)
    .filter(r => !country || r.country_code === country)
    .filter(r => !badge || r.status === badge);

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-2">
        {PROFESSION_IDS.map(id => (
          <button
            key={id}
            type="button"
            onClick={() => setProfession(profession === id ? "" : id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${profession === id ? "border-emerald-400 bg-emerald-400/20 text-emerald-400" : "border-border bg-panel hover:border-emerald-400/50"}`}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="rounded-xl border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50"
        >
          <option value="">{t(locale, "all_countries")}</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name[locale]}</option>
          ))}
        </select>
        <select
          value={badge}
          onChange={e => setBadge(e.target.value)}
          className="rounded-xl border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50"
        >
          <option value="">{t(locale, "radar_filter_all")}</option>
          <option value="A">{t(locale, "radar_filter_confirmed")}</option>
          <option value="B">{t(locale, "radar_filter_unverified")}</option>
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-3" id="radar-results">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted">Aucune offre confirmée cette semaine.</p>
        ) : (
          filtered.map(r => (
            <RadarOfferCard
              key={r.id}
              offer={r}
              status={r.status}
              professionId={r.professionId}
            />
          ))
        )}
      </div>
    </>
  );
}
