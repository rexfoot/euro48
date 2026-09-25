"use client";

import type { Offer } from "@/lib/offers";
import { useLocale } from "./LocaleProvider";
import { titleFor } from "@/lib/offer-display";

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

  return (
    <div className="group overflow-hidden border-y border-border bg-panel py-2">
      <div className="flex w-max animate-[ticker_60s_linear_infinite] gap-10 group-hover:[animation-play-state:paused]">
        {items.map((offer, i) => (
          <span key={`${offer.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-sm">
            <span className="text-accent-amber">●</span>
            {titleFor(offer, locale)}
            <span className="text-muted">· {offer.company} · {offer.city}</span>
          </span>
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
