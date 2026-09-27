"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { GlobeMethods } from "react-globe.gl";
import { CITIES, COUNTRIES, countryBadgeKeys, flagUrl, type CountryCode } from "@/lib/constants";
import { LANDMARKS } from "@/lib/landmarks";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";
import { Map2DFallback } from "./Map2DFallback";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

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
  badgeLabel: string;
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
  // No WebGL on phones at all (spec 2026-09-27): never fetch the
  // react-globe.gl chunk there, never run the FPS probe — phones get the
  // same flag pins via the lightweight 2D SVG map instead (Map2DFallback,
  // no WebGL, no continuous re-render loop).
  const [isMobile, setIsMobile] = useState(false);
  // A synchronous, instant read (no timed probe, no battery cost) —
  // device-memory/core-count is a decent real-world proxy for "too old
  // even for the lightweight map"; those phones get the flag grid
  // further down the page instead (spec 2026-09-27).
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);

    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
    const lowCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 2;
    setIsLowEndDevice(lowMemory || lowCores);

    return () => mql.removeEventListener("change", onChange);
  }, []);

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
    if (useFallback || isMobile) return;
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
  }, [useFallback, isMobile]);

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
    badgeLabel: countryBadgeKeys(l.country).map((k) => t(locale, k)).join(" · "),
  }));

  // Mobile: the same lightweight 2D map as desktop's slow-device
  // fallback (no WebGL, so no `useFallback`/FPS gate needed there) —
  // unless the device itself looks too old for that, in which case
  // render nothing here and let the flag grid further down the page
  // stand in for it.
  const showGlobe = !isMobile && !useFallback;
  const showFlagMap = isMobile ? !isLowEndDevice : useFallback;

  return (
    <div className="mx-auto w-full max-w-xl">
      {showFlagMap ? (
        <div ref={containerRef} className="w-full">
          <Map2DFallback cityCounts={cityCounts} countryCounts={countryCounts} reduceMotion={isMobile} />
        </div>
      ) : showGlobe ? (
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
              const hasOffers = p.count > 0;
              const wrap = document.createElement("div");
              wrap.style.cssText = "position:relative;transform:translate(-50%,-100%);cursor:pointer;display:flex;flex-direction:column;align-items:center;";
              wrap.innerHTML = `
                <div data-badge style="width:28px;height:28px;border-radius:9999px;overflow:hidden;
                  background:#0a0e17;
                  border:1.5px solid ${hasOffers ? "rgba(245,193,90,0.55)" : "rgba(148,163,184,0.35)"};
                  box-shadow:0 2px 8px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08);
                  opacity:${hasOffers ? 1 : 0.45}; filter:${hasOffers ? "none" : "grayscale(0.6)"};
                  transition:transform 150ms ease, border-color 150ms ease;">
                  <img src="${flagUrl(p.country)}" alt="" style="width:100%;height:100%;object-fit:cover;" />
                </div>
                <div data-count style="margin-top:2px;font-size:10px;font-weight:600;line-height:1;
                  color:${hasOffers ? "#F5C15A" : "#94a3b8"};">
                  ${hasOffers ? `+${p.count}` : "—"}
                </div>
                <div data-tooltip style="position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
                  white-space:nowrap;background:#0d1420;border:1px solid #1c2536;color:#ffffff;font-size:11px;
                  padding:4px 9px;border-radius:8px;opacity:0;pointer-events:none;transition:opacity 150ms ease;">
                  ${p.name}${p.badgeLabel ? ` · ${p.badgeLabel}` : ""}
                </div>`;
              const badge = wrap.querySelector("[data-badge]") as HTMLElement;
              const tooltip = wrap.querySelector("[data-tooltip]") as HTMLElement;
              wrap.addEventListener("mouseenter", () => {
                badge.style.transform = "scale(1.18)";
                if (hasOffers) badge.style.borderColor = "#F5C15A";
                tooltip.style.opacity = "1";
              });
              wrap.addEventListener("mouseleave", () => {
                badge.style.transform = "scale(1)";
                if (hasOffers) badge.style.borderColor = "rgba(245,193,90,0.55)";
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
      ) : null}
      {!isMobile && checkingPerf && !useFallback && (
        <p className="mt-2 text-center text-xs text-muted">Chargement du globe…</p>
      )}
    </div>
  );
}
