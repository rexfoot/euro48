"use client";

import Link from "next/link";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLocale } from "./LocaleProvider";
import { TAGLINE } from "@/lib/i18n";

export function Header() {
  const { locale } = useLocale();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight">
          Euro<span className="text-accent-amber">48</span>
        </span>
        <span className="hidden text-xs text-muted sm:inline">{TAGLINE[locale]}</span>
        <Link
          href="/radar-hors-ue"
          className="ml-2 rounded-full border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-400/20"
        >
          STARTS HERE
        </Link>
      </Link>
      <LanguageSwitch />
    </header>
  );
}
