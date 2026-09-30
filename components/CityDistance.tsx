"use client";

import { useState, useEffect } from "react";
import { COUNTRY_SERVICES } from "@/lib/country-services";
import type { CountryCode } from "@/lib/constants";
import { AdBanner } from "./AdBanner";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface CityDistanceProps {
  countryCode: CountryCode;
  city: string;
  cityLat?: number | null;
  cityLng?: number | null;
}

export function CityDistance({ countryCode, city, cityLat, cityLng }: CityDistanceProps) {
  const [distance, setDistance] = useState<number | null>(null);
  const services = COUNTRY_SERVICES[countryCode];

  useEffect(() => {
    if (cityLat && cityLng && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDistance(Math.round(haversineDistance(pos.coords.latitude, pos.coords.longitude, cityLat, cityLng)));
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, [cityLat, cityLng]);

  return (
    <div className="mb-6 space-y-3">
      {distance !== null && (
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3">
          <p className="text-lg font-semibold text-accent-amber">{distance.toLocaleString()} km</p>
          <p className="text-sm text-muted">desde tu posición actual</p>
        </div>
      )}

      {services && (
        <div className="rounded-xl border border-border bg-panel p-4">
          <h3 className="mb-3 text-sm font-semibold">Enlaces útiles — {countryCode}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ServiceGroup title="Emploi" items={services.employment} />
            <ServiceGroup title="Logement" items={services.housing} />
            <ServiceGroup title="Transport" items={services.transport} />
            <ServiceGroup title="Administration" items={services.administration} />
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <AdBanner />
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceGroup({ title, items }: { title: string; items: { name: string; url: string }[] }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-semibold text-muted">{title}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-accent-blue hover:underline"
          >
            {item.name} →
          </a>
        ))}
      </div>
    </div>
  );
}
