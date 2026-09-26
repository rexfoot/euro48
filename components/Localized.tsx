"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { cityLabel } from "@/lib/offer-display";
import { HOUSING_PORTALS } from "@/lib/housing-portals";

export function CountryName({ code }: { code: CountryCode }) {
  const { locale } = useLocale();
  const country = COUNTRIES.find((c) => c.code === code);
  return <>{country?.name[locale] ?? code}</>;
}

export function CityDisplayName({ city }: { city: string }) {
  const { locale } = useLocale();
  return <>{cityLabel(city, locale)}</>;
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

// One link out to the country's well-known local classifieds/real-estate
// portal — no price search or listings of our own (spec 2026-09-27).
export function HousingLink({ code }: { code: CountryCode }) {
  const { locale } = useLocale();
  const portal = HOUSING_PORTALS[code];
  if (!portal) return null;
  return (
    <a
      href={portal.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-panel px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-accent-amber/50 hover:text-foreground"
    >
      🏠 {t(locale, "housing_link", { portal: portal.name })}
    </a>
  );
}
