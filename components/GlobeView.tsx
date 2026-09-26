"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { GlobeMethods } from "react-globe.gl";
import { CITIES, COUNTRIES, type CountryCode } from "@/lib/constants";
import { LANDMARKS, LANDMARK_ICON_SVG } from "@/lib/landmarks";
import { useLocale } from "./LocaleProvider";
import { GlobeCountrySearch } from "./GlobeCountrySearch";
import { Map2DFallback } from "./Map2DFallback";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type GlobePoint = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
};

type LandmarkPoint = {
  lat: number;
  lng: number;
  country: CountryCode;
  name: string;
  count: number;
};

// NASA Blue Marble / topology textures — public domain, bundled examples
// of the three-globe library we already depend on (same CDN as before).
const GLOBE_TEXTURE = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const GLOBE_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";

export function GlobeView({
  cityCounts,
  countryCounts,
}: {
  cityCounts: Record<string, number>;
  countryCounts: Record<CountryCode, number>;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wasAutoRotating = useRef(true);
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
    const start = performance.now();
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

  function goToCountry(code: CountryCode) {
    const landmark = LANDMARKS.find((l) => l.country === code);
    const controls = globeRef.current?.controls?.();
    if (landmark && globeRef.current) {
      if (controls) controls.autoRotate = false;
      globeRef.current.pointOfView({ lat: landmark.lat, lng: landmark.lng, altitude: 1.6 }, 1200);
      setTimeout(() => router.push(`/${code.toLowerCase()}`), 1300);
    } else {
      router.push(`/${code.toLowerCase()}`);
    }
  }

  const points: GlobePoint[] = (Object.keys(CITIES) as (keyof typeof CITIES)[])
    .filter((city) => (cityCounts[city] ?? 0) > 0)
    .map((city) => ({
      lat: CITIES[city].lat,
      lng: CITIES[city].lng,
      city,
      country: CITIES[city].country,
      count: cityCounts[city],
    }));

  const landmarkPoints: LandmarkPoint[] = LANDMARKS.map((l) => ({
    lat: l.lat,
    lng: l.lng,
    country: l.country,
    name: COUNTRIES.find((c) => c.code === l.country)?.name[locale] ?? l.country,
    count: countryCounts[l.country] ?? 0,
  }));

  return (
    <div className="mx-auto w-full max-w-xl">
      <GlobeCountrySearch onSelect={goToCountry} />

      {useFallback ? (
        <div ref={containerRef} className="w-full">
          <Map2DFallback cityCounts={cityCounts} countryCounts={countryCounts} />
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseEnter={() => {
            const controls = globeRef.current?.controls?.();
            if (controls) {
              wasAutoRotating.current = controls.autoRotate;
              controls.autoRotate = false;
            }
          }}
          onMouseLeave={() => {
            const controls = globeRef.current?.controls?.();
            if (controls) controls.autoRotate = wasAutoRotating.current;
          }}
        >
          <Globe
            ref={globeRef as never}
            width={size.width}
            height={size.height}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl={GLOBE_TEXTURE}
            bumpImageUrl={GLOBE_BUMP}
            showAtmosphere
            atmosphereColor="#6fb3f2"
            atmosphereAltitude={0.2}
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
            htmlElementsData={landmarkPoints}
            htmlLat={(d: object) => (d as LandmarkPoint).lat}
            htmlLng={(d: object) => (d as LandmarkPoint).lng}
            htmlElement={(d: object) => {
              const p = d as LandmarkPoint;
              const wrap = document.createElement("div");
              wrap.style.cssText = "position:relative;transform:translate(-50%,-100%);cursor:pointer;";
              wrap.innerHTML = `
                <div data-badge style="width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;
                  background:radial-gradient(circle at 32% 28%, #1c2536, #0a0e17);
                  border:1.5px solid rgba(245,193,90,0.55);
                  box-shadow:0 2px 8px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08);
                  transition:transform 150ms ease, border-color 150ms ease;">
                  <svg viewBox="0 0 24 24" width="16" height="16" style="color:#F5C15A;">${LANDMARK_ICON_SVG[p.country]}</svg>
                </div>
                <div data-tooltip style="position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
                  white-space:nowrap;background:#0d1420;border:1px solid #1c2536;color:#ffffff;font-size:11px;
                  padding:4px 9px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity 150ms ease;">
                  ${p.name} · +${p.count}
                </div>`;
              const badge = wrap.querySelector("[data-badge]") as HTMLElement;
              const tooltip = wrap.querySelector("[data-tooltip]") as HTMLElement;
              wrap.addEventListener("mouseenter", () => {
                badge.style.transform = "scale(1.18)";
                badge.style.borderColor = "#F5C15A";
                tooltip.style.opacity = "1";
              });
              wrap.addEventListener("mouseleave", () => {
                badge.style.transform = "scale(1)";
                badge.style.borderColor = "rgba(245,193,90,0.55)";
                tooltip.style.opacity = "0";
              });
              wrap.addEventListener("click", () => router.push(`/${p.country.toLowerCase()}`));
              return wrap;
            }}
            onGlobeReady={() => {
              const controls = globeRef.current?.controls?.();
              if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 0.5;
              }
            }}
            animateIn={false}
          />
        </div>
      )}
      {checkingPerf && !useFallback && (
        <p className="mt-2 text-center text-xs text-muted">Chargement du globe…</p>
      )}
    </div>
  );
}
