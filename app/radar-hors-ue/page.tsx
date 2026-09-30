import type { Metadata } from "next";
import { getVisibleOffers } from "@/lib/offers";
import { classifyOffer } from "@/lib/eligibility";
import { COUNTRIES, type CountryCode } from "@/lib/constants";
import { RadarOfferCard } from "@/components/RadarOfferCard";
import { RadarToggle } from "@/components/RadarToggle";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "RADAR HORS UE — Euro48",
  description: "Offres d'emploi en Europe pour candidats hors UE. Sans garantie de visa.",
  alternates: pageAlternates("/radar-hors-ue"),
};

export const revalidate = 60;

const PROFESSION_IDS = [
  "carnicero", "panadero", "peluquero", "cocina", "construccion",
  "conductor", "mecanica", "limpieza", "agricultura", "hosteleria",
  "logistica", "cuidado",
] as const;

export default async function RadarHorsUePage() {
  const offers = await getVisibleOffers({ limit: 2000 });

  const radarOffers = offers
    .map(offer => {
      const result = classifyOffer(offer.title_original, offer.description ?? "");
      return { offer, ...result };
    })
    .filter(r => r.status === "A" || r.status === "B");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">RADAR HORS UE</h1>

      <div className="mt-3 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-4 text-sm text-accent-amber">
        Ces offres n'exigent pas d'habiter déjà en UE, ni un permis de travail européen déjà obtenu. Ce n'est pas une garantie de visa.
      </div>

      <p className="mt-4 text-sm text-muted">
        <span className="font-semibold text-accent-amber">+{radarOffers.length}</span> offres HORS UE
      </p>

      <div className="mt-6">
        <RadarToggle />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {PROFESSION_IDS.map(id => (
          <button
            key={id}
            type="button"
            className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm transition-colors hover:border-accent-amber/50"
          >
            {id}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <select className="rounded-xl border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50">
          <option value="">Tous les pays</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name.fr}</option>
          ))}
        </select>
        <select className="rounded-xl border border-border bg-panel px-3 py-2 text-sm outline-none focus:border-accent-amber/50">
          <option value="">Tous</option>
          <option value="A">Confirmado</option>
          <option value="B">A verificar</option>
        </select>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {radarOffers.length === 0 ? (
          <p className="text-sm text-muted">Aucune offre confirmée cette semaine.</p>
        ) : (
          radarOffers.map(r => (
            <RadarOfferCard
              key={r.offer.id}
              offer={r.offer}
              status={r.status}
              professionId={r.professionId}
            />
          ))
        )}
      </div>
    </main>
  );
}
