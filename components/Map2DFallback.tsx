"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES, COUNTRIES, countryBadgeKeys, flagUrl, type CountryCode } from "@/lib/constants";
import { project } from "@/lib/geo";
import { LANDMARKS } from "@/lib/landmarks";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

const WIDTH = 600;
const HEIGHT = 520;

export function Map2DFallback({
  cityCounts,
  countryCounts,
}: {
  cityCounts: Record<string, number>;
  countryCounts: Record<CountryCode, number>;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [hovered, setHovered] = useState<CountryCode | null>(null);
  const maxCount = Math.max(1, ...Object.values(cityCounts));

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="mx-auto h-full max-h-[420px] w-full max-w-xl"
      role="img"
      aria-label="Europe map"
    >
      <rect width={WIDTH} height={HEIGHT} fill="var(--panel)" rx={12} />
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={`v${i}`} x1={(i * WIDTH) / 12} y1={0} x2={(i * WIDTH) / 12} y2={HEIGHT} stroke="var(--border)" strokeWidth={0.5} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={`h${i}`} x1={0} y1={(i * HEIGHT) / 10} x2={WIDTH} y2={(i * HEIGHT) / 10} stroke="var(--border)" strokeWidth={0.5} />
      ))}
      {(Object.keys(CITIES) as (keyof typeof CITIES)[]).map((city) => {
        const { lat, lng, country } = CITIES[city];
        const { x, y } = project(lat, lng, WIDTH, HEIGHT);
        const count = cityCounts[city] ?? 0;
        const r = count > 0 ? 3 + Math.min(8, (count / maxCount) * 8) : 1.5;
        return (
          <g
            key={city}
            transform={`translate(${x}, ${y})`}
            className={count > 0 ? "cursor-pointer" : undefined}
            onClick={count > 0 ? () => router.push(`/${country.toLowerCase()}`) : undefined}
          >
            {count > 0 && (
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
        const { x, y } = project(l.lat, l.lng, WIDTH, HEIGHT);
        const name = COUNTRIES.find((c) => c.code === l.country)?.name[locale] ?? l.country;
        const count = countryCounts[l.country] ?? 0;
        const hasOffers = count > 0;
        const badgeLabel = countryBadgeKeys(l.country).map((k) => t(locale, k)).join(" · ");
        const isHovered = hovered === l.country;
        return (
          <g
            key={l.country}
            transform={`translate(${x}, ${y}) scale(${isHovered ? 1.25 : 1})`}
            className="cursor-pointer"
            opacity={hasOffers ? 1 : 0.45}
            onMouseEnter={() => setHovered(l.country)}
            onMouseLeave={() => setHovered((h) => (h === l.country ? null : h))}
            onClick={() => router.push(`/${l.country.toLowerCase()}`)}
          >
            <circle
              r={10}
              fill="url(#landmark-badge-fill)"
              stroke={isHovered && hasOffers ? "#F5C15A" : hasOffers ? "rgba(245,193,90,0.55)" : "rgba(148,163,184,0.35)"}
              strokeWidth={1.5}
            />
            <image
              href={flagUrl(l.country)}
              x={-9}
              y={-9}
              width={18}
              height={18}
              clipPath="url(#pin-flag-clip)"
              preserveAspectRatio="xMidYMid slice"
              style={hasOffers ? undefined : { filter: "grayscale(0.6)" }}
            />
            <text textAnchor="middle" y={22} fontSize={9} fontWeight={600} fill={hasOffers ? "#F5C15A" : "#94a3b8"}>
              {hasOffers ? `+${count}` : "—"}
            </text>
            {isHovered && (
              <g transform="translate(0,-16)">
                <text
                  textAnchor="middle"
                  y={-6}
                  fill="var(--foreground)"
                  fontSize={11}
                  stroke="var(--panel)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {name}{badgeLabel ? ` · ${badgeLabel}` : ""}
                </text>
              </g>
            )}
          </g>
        );
      })}

      <defs>
        <radialGradient id="landmark-badge-fill" cx="32%" cy="28%">
          <stop offset="0%" stopColor="#1c2536" />
          <stop offset="100%" stopColor="#0a0e17" />
        </radialGradient>
        <clipPath id="pin-flag-clip">
          <circle r={9} />
        </clipPath>
      </defs>
    </svg>
  );
}
