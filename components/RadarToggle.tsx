"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function RadarToggle() {
  const router = useRouter();
  const { locale } = useLocale();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/radar/count")
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

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
          className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
        >
          🌍 {t(locale, "radar_toggle_hors_ue")}
          {count !== null && (
            <span className="ml-1 rounded-full bg-emerald-400/20 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
              {count}
            </span>
          )}
        </button>
      </div>
      <p className="text-xs text-muted">{t(locale, "radar_microcopy")}</p>
    </div>
  );
}
