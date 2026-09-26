"use client";

import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function UnsubscribeMessage({ ok }: { ok: boolean }) {
  const { locale } = useLocale();
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">{t(locale, "unsubscribe_title")}</h1>
      <p className="text-muted">{t(locale, ok ? "unsubscribe_done" : "unsubscribe_invalid")}</p>
    </>
  );
}
