"use client";

import Link from "next/link";
import type { Offer } from "@/lib/offers";
import { flagUrl } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { titleFor, cityLabel } from "@/lib/offer-display";

// Seconds each offer stays visible while it crosses the screen — kept
// constant regardless of how many offers are shown, so the ticker reads
// at the same easy pace whether there are 5 offers or 30 (spec
// 2026-09-27: slow enough to read and tap, not just glance at).
const SECONDS_PER_OFFER = 7;

export function Ticker({ offers }: { offers: Offer[] }) {
  const { locale } = useLocale();

  if (offers.length === 0) {
    return (
      <div className="border-y border-border bg-panel py-2 text-center text-xs text-muted">
        —
      </div>
    );
  }

  const items = [...offers, ...offers]; // duplicate for seamless loop
  const duration = offers.length * SECONDS_PER_OFFER;

  return (
    <div className="group overflow-hidden border-y border-border bg-panel py-2">
      <div
        className="flex w-max gap-10 group-hover:[animation-play-state:paused]"
        style={{ animation: `ticker ${duration}s linear infinite` }}
      >
        {items.map((offer, i) => (
          <Link
            key={`${offer.id}-${i}`}
            href={`/job/${encodeURIComponent(offer.id)}`}
            className="flex items-center gap-2 whitespace-nowrap text-sm hover:underline"
          >
            <img
              src={flagUrl(offer.country_code)}
              alt=""
              className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
            />
            {titleFor(offer, locale)}
            <span className="text-muted">
              · {offer.company} · {cityLabel(offer.city, locale, offer.country_code)}
            </span>
          </Link>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
