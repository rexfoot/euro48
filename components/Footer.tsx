"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function Footer() {
  const { locale } = useLocale();
  return (
    <footer className="flex flex-wrap items-center justify-center gap-4 border-t border-border px-4 py-4 text-xs text-muted">
      <Link href="/about" className="hover:text-foreground">{t(locale, "about_link")}</Link>
      <Link href="/alerts" className="hover:text-foreground">{t(locale, "alerts_link")}</Link>
      <Link href="/legal/privacy" className="hover:text-foreground">{t(locale, "privacy_link")}</Link>
      <Link href="/legal/terms" className="hover:text-foreground">{t(locale, "terms_link")}</Link>
      <span>hello@euro48.com</span>
    </footer>
  );
}
