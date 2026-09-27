"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, COUNTRIES, countryBadgeKeys, flagUrl, type CountryCode } from "@/lib/constants";
import { LANDMARKS } from "@/lib/landmarks";
import { toMapPercent } from "@/lib/europe-geo";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

export function Map2DFallback({
  cityCounts,
  countryCounts,
  reduceMotion = false,
}: {
  cityCounts: Record<string, number>;
  countryCounts: Record<CountryCode, number>;
  // Skips the pulsing city-dot animation — used on mobile, where this map
  // stands in for the globe and battery cost matters (spec 2026-09-27).
  reduceMotion?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [hovered, setHovered] = useState<CountryCode | null>(null);
  const maxCount = Math.max(1, ...Object.values(cityCounts));

  return (
    <div className="relative mx-auto w-full max-w-xl select-none overflow-hidden rounded-xl">
      {/* NASA Blue Marble (public domain), cropped to Europe — see
          scripts/generate-europe-map.ts. Real coastlines/relief, not drawn. */}
      <img
        src="/images/europe-satellite.jpg"
        alt="Europe"
        draggable={false}
        className="block w-full h-auto"
      />

      {(Object.keys(CITIES) as (keyof typeof CITIES)[]).map((city) => {
        const { lat, lng, country } = CITIES[city];
        const { xPct, yPct } = toMapPercent(lng, lat);
        const count = cityCounts[city] ?? 0;
        if (count === 0) return null;
        const size = 4 + Math.min(10, (count / maxCount) * 10);
        return (
          <button
            key={city}
            type="button"
            aria-label={city}
            onClick={() => router.push(`/${country.toLowerCase()}`)}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            {!reduceMotion && (
              <span
                className="absolute inset-0 -m-1.5 animate-ping rounded-full bg-accent-amber/40"
                style={{ animationDuration: "2.5s" }}
              />
            )}
            <span
              className="relative block rounded-full bg-accent-amber shadow-[0_0_4px_rgba(0,0,0,0.6)]"
              style={{ width: size, height: size }}
            />
          </button>
        );
      })}

      {LANDMARKS.map((l) => {
        const { xPct, yPct } = toMapPercent(l.lng, l.lat);
        const name = COUNTRIES.find((c) => c.code === l.country)?.name[locale] ?? l.country;
        const count = countryCounts[l.country] ?? 0;
        const hasOffers = count > 0;
        const badgeLabel = countryBadgeKeys(l.country).map((k) => t(locale, k)).join(" · ");
        const isHovered = hovered === l.country;

        return (
          <button
            key={l.country}
            type="button"
            onClick={() => router.push(`/${l.country.toLowerCase()}`)}
            onMouseEnter={() => setHovered(l.country)}
            onMouseLeave={() => setHovered((h) => (h === l.country ? null : h))}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center"
            style={{ left: `${xPct}%`, top: `${yPct}%`, opacity: hasOffers ? 1 : 0.5 }}
          >
            <span
              className="flex items-center justify-center overflow-hidden rounded-full border-2 shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-transform"
              style={{
                width: 44,
                height: 44,
                borderColor: hasOffers ? (isHovered ? "#F5C15A" : "rgba(245,193,90,0.65)") : "rgba(148,163,184,0.5)",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                background: "radial-gradient(circle at 32% 28%, #1c2536, #0a0e17)",
              }}
            >
              <img
                src={flagUrl(l.country)}
                alt={name}
                className="h-full w-full object-cover"
                style={hasOffers ? undefined : { filter: "grayscale(0.6)" }}
              />
            </span>
            <span
              className="mt-1 rounded-full bg-background/80 px-1.5 text-xs font-bold leading-tight"
              style={{ color: hasOffers ? "#F5C15A" : "#94a3b8" }}
            >
              {hasOffers ? `+${count}` : "—"}
            </span>
            {isHovered && (
              <span className="absolute bottom-full mb-1 whitespace-nowrap rounded-lg border border-border bg-panel px-2.5 py-1 text-xs text-foreground shadow-lg">
                {name}
                {badgeLabel ? ` · ${badgeLabel}` : ""}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
