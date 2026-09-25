"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";

export function CountryName({ code }: { code: CountryCode }) {
  const { locale } = useLocale();
  const country = COUNTRIES.find((c) => c.code === code);
  return <>{country?.name[locale] ?? code}</>;
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
