"use client";

import { useState, useEffect } from "react";
import { COUNTRY_SERVICES } from "@/lib/country-services";
import type { CountryCode } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

interface ServicesModalProps {
  countryCode: CountryCode;
  city: string;
  cityLat?: number | null;
  cityLng?: number | null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function ServicesModal({ countryCode, city, cityLat, cityLng }: ServicesModalProps) {
  const [open, setOpen] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const { locale } = useLocale();
  const services = COUNTRY_SERVICES[countryCode];

  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, [open]);

  if (!services) return null;

  const distance =
    userLat && userLng && cityLat && cityLng
      ? Math.round(haversineDistance(userLat, userLng, cityLat, cityLng))
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-panel px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent-amber/50 hover:text-foreground"
      >
        📍 Distance & services
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">📍 {city}, {countryCode}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-muted hover:bg-border hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {distance !== null && (
              <div className="mb-4 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-sm">
                <p className="font-semibold text-accent-amber">{distance.toLocaleString()} km</p>
                <p className="text-muted">depuis votre position</p>
              </div>
            )}

            {cityLat && cityLng && (
              <div className="mb-4 rounded-xl border border-border bg-background p-3 text-sm">
                <p className="font-medium">{city}</p>
                <p className="text-muted">{cityLat.toFixed(4)}, {cityLng.toFixed(4)}</p>
              </div>
            )}

            <div className="space-y-4">
              <ServiceSection title="Emploi" items={services.employment} />
              <ServiceSection title="Logement" items={services.housing} />
              <ServiceSection title="Transport" items={services.transport} />
              <ServiceSection title="Administration" items={services.administration} />

              <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <h4 className="mb-2 text-sm font-semibold text-emerald-400">Bons plans sur mon trajet</h4>
                <div className="space-y-2">
                  {services.partners.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-emerald-400 hover:underline"
                    >
                      {p.name} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ServiceSection({ title, items }: { title: string; items: { name: string; url: string }[] }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
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
