"use client";

import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/constants";
import { project } from "@/lib/geo";

const WIDTH = 600;
const HEIGHT = 520;

export function Map2DFallback({ cityCounts }: { cityCounts: Record<string, number> }) {
  const router = useRouter();
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
    </svg>
  );
}
