"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function EmptyState() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="text-muted">{t(locale, "no_offers")}</p>
      <p className="text-sm text-muted/70">{t(locale, "no_offers_sub")}</p>
    </div>
  );
}
