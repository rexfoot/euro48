"use client";

import { useState } from "react";
import { COUNTRIES } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { RadarOfferCard } from "./RadarOfferCard";
import type { Offer } from "@/lib/offers";
import type { EligibilityStatus } from "@/lib/eligibility";

type RadarOffer = Offer & { status: EligibilityStatus; professionId: string | null };

const PROFESSION_IDS = [
  "carnicero", "panadero", "peluquero", "cocina", "construccion",
  "conductor", "mecanica", "limpieza", "agricultura", "hosteleria",
  "logistica", "cuidado",
] as const;

const PROFESSION_NAMES: Record<(typeof PROFESSION_IDS)[number], Record<string, string>> = {
  carnicero: { fr: "Boucher", es: "Carnicero", en: "Butcher" },
  panadero: { fr: "Boulanger", es: "Panadero", en: "Baker" },
  peluquero: { fr: "Coiffeur", es: "Peluquero", en: "Hairdresser" },
  cocina: { fr: "Cuisine", es: "Cocina", en: "Kitchen" },
  construccion: { fr: "Construction", es: "Construcción", en: "Construction" },
  conductor: { fr: "Chauffeur", es: "Conductor", en: "Driver" },
  mecanica: { fr: "Mécanique", es: "Mecánica", en: "Mechanic" },
  limpieza: { fr: "Nettoyage", es: "Limpieza", en: "Cleaning" },
  agricultura: { fr: "Agriculture", es: "Agricultura", en: "Agriculture" },
  hosteleria: { fr: "Hôtellerie", es: "Hostelería", en: "Hospitality" },
  logistica: { fr: "Logistique", es: "Logística", en: "Logistics" },
  cuidado: { fr: "Aide à la personne", es: "Cuidado", en: "Care" },
};

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
            {PROFESSION_NAMES[id][locale]}
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
