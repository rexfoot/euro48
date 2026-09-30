"use client";

import { useState, useEffect } from "react";
import { getVisibleOffers } from "@/lib/offers";
import { classifyOffer } from "@/lib/eligibility";
import { RadarOfferCard } from "@/components/RadarOfferCard";
import { RadarToggle } from "@/components/RadarToggle";
import { RadarFilters } from "@/components/RadarFilters";
import type { Offer } from "@/lib/offers";
import type { EligibilityStatus } from "@/lib/eligibility";

type RadarOffer = Offer & { status: EligibilityStatus; professionId: string | null };

export default function RadarHorsUePage() {
  const [offers, setOffers] = useState<RadarOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ profession: "", country: "", badge: "" });

  useEffect(() => {
    getVisibleOffers({ limit: 2000 })
      .then(offers => {
        const radar = offers
          .map(offer => {
            const result = classifyOffer(offer.title_original, offer.description ?? "");
            return { ...offer, status: result.status, professionId: result.professionId };
          })
          .filter((r): r is RadarOffer => r.status === "A" || r.status === "B");
        setOffers(radar);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = offers
    .filter(r => !filters.profession || r.professionId === filters.profession)
    .filter(r => !filters.country || r.country_code === filters.country)
    .filter(r => !filters.badge || r.status === filters.badge);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">RADAR HORS UE</h1>

      <div className="mt-3 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4 text-sm text-accent-amber">
        Ces offres n'exigent pas d'habiter déjà en UE, ni un permis de travail européen déjà obtenu. Ce n'est pas une garantie de visa.
      </div>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-accent-amber">+{filtered.length}</span> offres HORS UE
      </p>

      <div className="mt-6">
        <RadarToggle />
      </div>

      <RadarFilters onFilter={setFilters} />

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <p className="text-sm text-muted">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">Aucune offre confirmée cette semaine.</p>
        ) : (
          filtered.map(r => (
            <RadarOfferCard
              key={r.id}
              offer={r}
              status={r.status}
              professionId={r.professionId}
            />
          ))
        )}
      </div>
    </main>
  );
}
