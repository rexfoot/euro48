"use client";

import type { Offer } from "@/lib/offers";
import type { EligibilityStatus } from "@/lib/eligibility";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { cityLabel } from "@/lib/offer-display";
import { ServicesModal } from "./ServicesModal";

const PROFESSION_NAMES: Record<string, Record<string, string>> = {
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

interface RadarOfferCardProps {
  offer: Offer;
  status: EligibilityStatus;
  professionId: string | null;
}

export function RadarOfferCard({ offer, status, professionId }: RadarOfferCardProps) {
  const { locale } = useLocale();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-panel p-4">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status === "A" ? "bg-accent-amber/20 text-accent-amber" : "bg-border text-muted"}`}>
          {status === "A" ? t(locale, "radar_badge_confirmed") : t(locale, "radar_badge_unverified")}
        </span>
        {professionId && (
          <span className="rounded-full bg-border px-2 py-0.5 text-xs text-muted">
            {PROFESSION_NAMES[professionId]?.[locale] ?? professionId}
          </span>
        )}
      </div>

      <h3 className="font-medium leading-snug">{offer.title_original}</h3>

      <p className="text-sm text-muted">
        {offer.company} · {cityLabel(offer.city, locale, offer.country_code)} · {offer.country_code}
      </p>

      {offer.salary_raw && (
        <p className="text-sm text-muted">{offer.salary_raw}</p>
      )}

      {offer.contract_type && (
        <p className="text-xs text-muted">{offer.contract_type}</p>
      )}

      <p className="text-xs text-muted/70">
        {t(locale, "ad_language", { lang: offer.language_of_ad.toUpperCase() })}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-amber px-3 py-1.5 text-sm font-medium text-[#070B14] transition-opacity hover:opacity-90"
        >
          {t(locale, "see_offer")}
        </a>
        <ServicesModal
          countryCode={offer.country_code}
          city={offer.city}
          cityLat={offer.city_lat}
          cityLng={offer.city_lng}
        />
      </div>
    </div>
  );
}
