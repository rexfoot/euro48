"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, COUNTRIES, countryBadgeKeys, flagUrl, type CountryCode } from "@/lib/constants";
import { projectPoint, mapCountries, MAP_WIDTH, MAP_HEIGHT } from "@/lib/europe-geo";
import { LANDMARKS } from "@/lib/landmarks";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

const SEA = "#0a1622";
const LAND = "#1a2636";
const LAND_BORDER = "#33465f";
const PIN_RADIUS = 17; // large, tappable flag pins (spec 2026-09-27: "grandes y claras")

export function Map2DFallback({
  cityCounts,
  countryCounts,
  reduceMotion = false,
}: {
  cityCounts: Record<string, number>;
  countryCounts: Record<CountryCode, number>;
  // Skips the pulsing-ring SMIL animations — used on mobile, where this
  // map stands in for the globe and battery cost matters (spec 2026-09-27).
  reduceMotion?: boolean;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [hovered, setHovered] = useState<CountryCode | null>(null);
  const maxCount = Math.max(1, ...Object.values(cityCounts));

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="mx-auto h-full max-h-[420px] w-full max-w-xl"
      role="img"
      aria-label="Europe map"
    >
      <defs>
        <clipPath id="map-rounded-clip">
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx={12} />
        </clipPath>
        <radialGradient id="landmark-badge-fill" cx="32%" cy="28%">
          <stop offset="0%" stopColor="#1c2536" />
          <stop offset="100%" stopColor="#0a0e17" />
        </radialGradient>
        <clipPath id="pin-flag-clip">
          <circle r={PIN_RADIUS - 2} />
        </clipPath>
      </defs>

      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill={SEA} rx={12} />
      <g clipPath="url(#map-rounded-clip)">
        {mapCountries.map((c, i) => (
          <path key={i} d={c.path} fill={LAND} stroke={LAND_BORDER} strokeWidth={0.75} strokeLinejoin="round" />
        ))}
      </g>

      {(Object.keys(CITIES) as (keyof typeof CITIES)[]).map((city) => {
        const { lat, lng, country } = CITIES[city];
        const [x, y] = projectPoint(lng, lat);
        const count = cityCounts[city] ?? 0;
        const r = count > 0 ? 3 + Math.min(8, (count / maxCount) * 8) : 1.5;
        return (
          <g
            key={city}
            transform={`translate(${x}, ${y})`}
            className={count > 0 ? "cursor-pointer" : undefined}
            onClick={count > 0 ? () => router.push(`/${country.toLowerCase()}`) : undefined}
          >
            {count > 0 && !reduceMotion && (
              <circle r={r + 4} fill="var(--accent-amber)" opacity={0.25}>
                <animate attributeName="r" values={`${r};${r + 8};${r}`} dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={r} fill={count > 0 ? "var(--accent-amber)" : "var(--border)"} />
          </g>
        );
      })}

      {LANDMARKS.map((l) => {
        const [x, y] = projectPoint(l.lng, l.lat);
        const name = COUNTRIES.find((c) => c.code === l.country)?.name[locale] ?? l.country;
        const count = countryCounts[l.country] ?? 0;
        const hasOffers = count > 0;
        const badgeLabel = countryBadgeKeys(l.country).map((k) => t(locale, k)).join(" · ");
        const isHovered = hovered === l.country;

        return (
          <g
            key={l.country}
            transform={`translate(${x}, ${y}) scale(${isHovered ? 1.12 : 1})`}
            className="cursor-pointer"
            opacity={hasOffers ? 1 : 0.45}
            onMouseEnter={() => setHovered(l.country)}
            onMouseLeave={() => setHovered((h) => (h === l.country ? null : h))}
            onClick={() => router.push(`/${l.country.toLowerCase()}`)}
          >
            <circle
              r={PIN_RADIUS}
              fill="url(#landmark-badge-fill)"
              stroke={isHovered && hasOffers ? "#F5C15A" : hasOffers ? "rgba(245,193,90,0.6)" : "rgba(148,163,184,0.35)"}
              strokeWidth={2}
            />
            <image
              href={flagUrl(l.country)}
              x={-PIN_RADIUS + 2}
              y={-PIN_RADIUS + 2}
              width={(PIN_RADIUS - 2) * 2}
              height={(PIN_RADIUS - 2) * 2}
              clipPath="url(#pin-flag-clip)"
              preserveAspectRatio="xMidYMid slice"
              style={hasOffers ? undefined : { filter: "grayscale(0.6)" }}
            />
            <text
              textAnchor="middle"
              y={PIN_RADIUS + 13}
              fontSize={12}
              fontWeight={700}
              fill={hasOffers ? "#F5C15A" : "#94a3b8"}
              stroke={SEA}
              strokeWidth={3}
              paintOrder="stroke"
            >
              {hasOffers ? `+${count}` : "—"}
            </text>
            {isHovered && (
              <g transform="translate(0,-24)">
                <text
                  textAnchor="middle"
                  y={-6}
                  fill="var(--foreground)"
                  fontSize={12}
                  stroke={SEA}
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {name}
                  {badgeLabel ? ` · ${badgeLabel}` : ""}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
