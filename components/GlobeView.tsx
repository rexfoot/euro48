"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/constants";
import { Map2DFallback } from "./Map2DFallback";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type GlobePoint = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
};

const GLOBE_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-dark.jpg";

export function GlobeView({ cityCounts }: { cityCounts: Record<string, number> }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<{ controls: () => { autoRotate: boolean; autoRotateSpeed: number } } | null>(null);
  const [size, setSize] = useState({ width: 320, height: 320 });
  const [useFallback, setUseFallback] = useState(false);
  const [checkingPerf, setCheckingPerf] = useState(true);

  useEffect(() => {
    function updateSize() {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      setSize({ width: w, height: Math.min(w, 480) });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (useFallback) return;
    let frames = 0;
    let start = performance.now();
    let raf: number;
    let done = false;

    function tick() {
      frames++;
      const elapsed = performance.now() - start;
      if (elapsed >= 2000) {
        if (!done) {
          done = true;
          const fps = (frames / elapsed) * 1000;
          if (fps < 30) setUseFallback(true);
          setCheckingPerf(false);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [useFallback]);

  const points: GlobePoint[] = (Object.keys(CITIES) as (keyof typeof CITIES)[])
    .filter((city) => (cityCounts[city] ?? 0) > 0)
    .map((city) => ({
      lat: CITIES[city].lat,
      lng: CITIES[city].lng,
      city,
      country: CITIES[city].country,
      count: cityCounts[city],
    }));

  if (useFallback) {
    return (
      <div ref={containerRef} className="w-full">
        <Map2DFallback cityCounts={cityCounts} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-xl">
      <Globe
        ref={globeRef as never}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={GLOBE_TEXTURE}
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#F5C15A"}
        pointAltitude={0.01}
        pointRadius={(d: object) => 0.3 + Math.min(1, (d as GlobePoint).count / 20)}
        pointLabel={(d: object) => {
          const p = d as GlobePoint;
          return `${p.city} — ${p.count}`;
        }}
        onPointClick={(d: object) => {
          const p = d as GlobePoint;
          router.push(`/${p.country.toLowerCase()}`);
        }}
        onGlobeReady={() => {
          const controls = globeRef.current?.controls();
          if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
          }
        }}
        animateIn={false}
      />
      {checkingPerf && (
        <p className="mt-2 text-center text-xs text-muted">Chargement du globe…</p>
      )}
    </div>
  );
}
