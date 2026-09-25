"use client";

import { useLocale } from "./LocaleProvider";
import { LOCALES } from "@/lib/constants";

const LABELS: Record<string, string> = { fr: "FR", es: "ES", en: "EN" };

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-panel p-1 text-xs font-medium">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === l ? "bg-accent-amber text-[#070B14]" : "text-muted hover:text-foreground"
          }`}
          aria-pressed={locale === l}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
