"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function Counter({ count }: { count: number }) {
  const { locale } = useLocale();
  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-accent-amber">
        {t(locale, "counter_prefix")}
        {count}
      </span>{" "}
      {t(locale, "counter_suffix")}
    </p>
  );
}
