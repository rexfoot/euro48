"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function RadarToggle() {
  const router = useRouter();
  const { locale } = useLocale();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex rounded-xl border border-border bg-panel p-1">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors bg-accent-amber text-background"
          aria-current="true"
        >
          🕐 {t(locale, "radar_toggle_48h")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/radar-hors-ue")}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          🌍 {t(locale, "radar_toggle_hors_ue")}
        </button>
      </div>
      <p className="text-xs text-muted">{t(locale, "radar_microcopy")}</p>
    </div>
  );
}
