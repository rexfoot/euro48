"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { cityLabel } from "@/lib/offer-display";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";

export function CountryName({ code }: { code: CountryCode }) {
  const { locale } = useLocale();
  const country = COUNTRIES.find((c) => c.code === code);
  return <>{country?.name[locale] ?? code}</>;
}

export function CityDisplayName({ city, country }: { city: string; country: CountryCode }) {
  const { locale } = useLocale();
  return <>{cityLabel(city, locale, country)}</>;
}

export function SpecialtyName({ id }: { id: SpecialtyId }) {
  const { locale } = useLocale();
  const specialty = SPECIALTIES.find((s) => s.id === id);
  return <>{specialty?.name[locale] ?? id}</>;
}

export function BackLink({ href }: { href: string }) {
  const { locale } = useLocale();
  return (
    <Link href={href} className="text-sm text-muted hover:text-foreground">
      ← {t(locale, "back")}
    </Link>
  );
}

export function SectionLabel({ labelKey }: { labelKey: string }) {
  const { locale } = useLocale();
  return <h2 className="text-sm font-medium text-muted">{t(locale, labelKey)}</h2>;
}

// Housing + furniture affiliate links, sourced from AFFILIATE_LINKS
// per country (spec 2026-09-28).
const AFFILIATE_LINK_CLASS =
  "inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-panel px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-accent-amber/50 hover:text-foreground";

export function HousingLink({ code }: { code: CountryCode }) {
  const { locale } = useLocale();
  const links = AFFILIATE_LINKS[code];
  if (!links) return null;
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={links.housingUrl}
        target="_blank"
        rel="sponsored noopener"
        className={AFFILIATE_LINK_CLASS}
      >
        🏠 {t(locale, "housing_link")}
      </a>
      <a
        href={links.furnitureUrl}
        target="_blank"
        rel="sponsored noopener"
        className={AFFILIATE_LINK_CLASS}
      >
        🛋️ {t(locale, "furniture_link")}
      </a>
    </div>
  );
}
