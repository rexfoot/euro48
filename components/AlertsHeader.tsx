"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { BackLink } from "./Localized";

export function AlertsHeader() {
  const { locale } = useLocale();
  return (
    <>
      <BackLink href="/" />
      <h1 className="mt-2 mb-1 text-2xl font-semibold">{t(locale, "alerts_title")}</h1>
      <p className="text-sm text-muted">{t(locale, "alerts_sub")}</p>
    </>
  );
}
