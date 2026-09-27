"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";

// SVG only (spec 2026-09-27: emoji flags don't render on Windows) — a
// separate helper from lib/constants's flagUrl (which the rest of the
// site keeps using as PNG) so this component is the only thing affected.
function flagSvgUrl(code: CountryCode): string {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

// Real-time hand rotation is driven entirely by CSS (one infinite linear
// animation per hand, synced once via a negative animation-delay equal to
// how far into its own cycle the current moment already is) — no ongoing
// JS ticking, no re-renders once mounted.
function delaysFor(now: Date) {
  const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
  const minutes = now.getMinutes() * 60 + seconds;
  const hours = (now.getHours() % 12) * 3600 + minutes;
  return { secondDelay: -seconds, minuteDelay: -minutes, hourDelay: -hours };
}

export function AnalogClock() {
  // Server and first client paint render identical, motionless hands (no
  // delay set yet) — the visitor's local time is only knowable client-side,
  // so real positions are applied post-mount to avoid a hydration mismatch
  // or a flash of the wrong time.
  const [delays, setDelays] = useState<{ secondDelay: number; minuteDelay: number; hourDelay: number } | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    setDelays(delaysFor(new Date()));
  }, []);

  const flagCount = COUNTRIES.length;

  return (
    <div className="euro48-clock mx-auto">
      <div className="euro48-clock-ring">
        {COUNTRIES.map((country, i) => {
          const angle = (360 / flagCount) * i;
          return (
            <div
              key={country.code}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `rotate(${angle}deg) translateX(var(--ring-radius))`, transformOrigin: "0 0" }}
            >
              <Link
                href={`/${country.code.toLowerCase()}`}
                aria-label={country.name[locale]}
                className="group block -translate-x-1/2 -translate-y-1/2"
              >
                {/* Cancels this flag's own static placement angle first — the
                    ring rotation and the counterspin below only cancel each
                    other out, they never account for the fixed angle each
                    flag was placed at, so every flag but the one at 0deg
                    stayed permanently tilted by its own placement angle
                    (found live: Switzerland's centered cross rendering as an
                    "X" made a 48deg tilt obvious; every other flag had the
                    same bug, just less visible on busier flag patterns). */}
                <div style={{ transform: `rotate(${-angle}deg)` }}>
                  <div className="euro48-counterspin">
                    <span className="block scale-100 transition-transform duration-200 group-hover:scale-110">
                      <img
                        src={flagSvgUrl(country.code)}
                        alt=""
                        className="euro48-flag rounded-full border-2 border-accent-amber/40 object-cover shadow-[0_2px_10px_rgba(0,0,0,0.6)] transition-colors duration-200 group-hover:border-accent-amber"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="euro48-dial">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-full w-full"
            style={{ transform: `translate(-50%, -50%) rotate(${i * 30}deg)` }}
          >
            <span className="euro48-tick" />
          </div>
        ))}

        <span className="euro48-wordmark">Europe</span>

        <div
          className="euro48-hand euro48-hand-hour"
          style={delays ? { animationDelay: `${delays.hourDelay}s` } : { opacity: 0 }}
        />
        <div
          className="euro48-hand euro48-hand-minute"
          style={delays ? { animationDelay: `${delays.minuteDelay}s` } : { opacity: 0 }}
        />
        <div
          className="euro48-hand euro48-hand-second"
          style={delays ? { animationDelay: `${delays.secondDelay}s` } : { opacity: 0 }}
        />
        <div className="euro48-pivot" />
      </div>

      <style>{`
        .euro48-clock {
          position: relative;
          width: 264px;
          height: 264px;
        }
        @media (min-width: 480px) {
          .euro48-clock { width: 320px; height: 320px; }
        }
        @media (min-width: 768px) {
          .euro48-clock { width: 400px; height: 400px; }
        }

        .euro48-clock-ring {
          position: absolute;
          inset: 0;
          --ring-radius: 110px;
          animation: euro48-orbit 130s linear infinite;
        }
        @media (min-width: 480px) {
          .euro48-clock-ring { --ring-radius: 136px; }
        }
        @media (min-width: 768px) {
          .euro48-clock-ring { --ring-radius: 172px; }
        }

        .euro48-counterspin {
          animation: euro48-counter-orbit 130s linear infinite;
        }

        .euro48-flag {
          width: 30px;
          height: 30px;
        }
        @media (min-width: 480px) {
          .euro48-flag { width: 34px; height: 34px; }
        }
        @media (min-width: 768px) {
          .euro48-flag { width: 40px; height: 40px; }
        }

        .euro48-dial {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 168px;
          height: 168px;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          background: radial-gradient(circle at 35% 30%, var(--panel), var(--background));
          border: 2px solid rgba(245, 193, 90, 0.35);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.06);
        }
        @media (min-width: 480px) {
          .euro48-dial { width: 208px; height: 208px; }
        }
        @media (min-width: 768px) {
          .euro48-dial { width: 268px; height: 268px; }
        }

        .euro48-tick {
          position: absolute;
          left: 50%;
          top: 6px;
          width: 2px;
          height: 10px;
          transform: translateX(-50%);
          background: rgba(245, 193, 90, 0.55);
          border-radius: 2px;
        }
        @media (min-width: 768px) {
          .euro48-tick { top: 10px; height: 14px; }
        }

        .euro48-wordmark {
          position: absolute;
          left: 50%;
          top: 64%;
          transform: translate(-50%, -50%);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(245, 193, 90, 0.75);
          white-space: nowrap;
        }
        @media (min-width: 768px) {
          .euro48-wordmark { font-size: 11px; top: 65%; }
        }

        .euro48-hand {
          position: absolute;
          left: 50%;
          top: 50%;
          transform-origin: 50% 100%;
          border-radius: 3px;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .euro48-hand-hour {
          width: 4px;
          height: 44px;
          background: var(--foreground);
          transform: translate(-50%, -100%) rotate(0deg);
          animation-name: euro48-hour-hand;
          animation-duration: 43200s;
        }
        .euro48-hand-minute {
          width: 3px;
          height: 62px;
          background: var(--foreground);
          transform: translate(-50%, -100%) rotate(0deg);
          animation-name: euro48-minute-hand;
          animation-duration: 3600s;
        }
        .euro48-hand-second {
          width: 2px;
          height: 70px;
          background: var(--accent-amber);
          transform: translate(-50%, -100%) rotate(0deg);
          animation-name: euro48-second-hand;
          animation-duration: 60s;
        }
        @media (min-width: 480px) {
          .euro48-hand-hour { height: 54px; }
          .euro48-hand-minute { height: 76px; }
          .euro48-hand-second { height: 86px; }
        }
        @media (min-width: 768px) {
          .euro48-hand-hour { height: 72px; }
          .euro48-hand-minute { height: 100px; }
          .euro48-hand-second { height: 112px; }
        }

        .euro48-pivot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 9px;
          height: 9px;
          transform: translate(-50%, -50%);
          border-radius: 9999px;
          background: var(--accent-amber);
          border: 2px solid var(--background);
          box-shadow: 0 0 6px rgba(245, 193, 90, 0.7);
        }

        @keyframes euro48-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes euro48-counter-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes euro48-hour-hand {
          from { transform: translate(-50%, -100%) rotate(0deg); }
          to { transform: translate(-50%, -100%) rotate(360deg); }
        }
        @keyframes euro48-minute-hand {
          from { transform: translate(-50%, -100%) rotate(0deg); }
          to { transform: translate(-50%, -100%) rotate(360deg); }
        }
        @keyframes euro48-second-hand {
          from { transform: translate(-50%, -100%) rotate(0deg); }
          to { transform: translate(-50%, -100%) rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          .euro48-clock-ring,
          .euro48-counterspin {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
