"use client";

import { useState, useEffect } from "react";

type Ad = {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
};

export function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((r) => r.json())
      .then((data) => setAds(data.ads ?? []))
      .catch(() => {});
  }, []);

  if (ads.length === 0) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl border border-border bg-panel transition-colors hover:border-accent-amber/50"
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="h-auto w-full object-cover"
          />
          {ad.title && (
            <p className="p-2 text-center text-xs text-muted">{ad.title}</p>
          )}
        </a>
      ))}
    </div>
  );
}
