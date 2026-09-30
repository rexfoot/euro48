import type { Metadata } from "next";
import { getVisibleOffers } from "@/lib/offers";
import { classifyOffer } from "@/lib/eligibility";
import { RadarOfferCard } from "@/components/RadarOfferCard";
import { RadarToggle } from "@/components/RadarToggle";
import { RadarFilters } from "@/components/RadarFilters";
import { pageAlternates } from "@/lib/seo";
import { RadarPageContent } from "@/components/RadarPageContent";

export const metadata: Metadata = {
  title: "RADAR HORS UE — Euro48",
  description: "Offres d'emploi en Europe pour candidats hors UE. Sans garantie de visa.",
  alternates: pageAlternates("/radar-hors-ue"),
};

export const revalidate = 60;

export default async function RadarHorsUePage() {
  const offers = await getVisibleOffers({ limit: 2000 });

  const radarOffers = offers
    .map(offer => {
      const result = classifyOffer(offer.title_original, offer.description ?? "");
      return { ...offer, status: result.status, professionId: result.professionId };
    })
    .filter(r => r.status === "A" || r.status === "B");

  return <RadarPageContent offers={radarOffers} />;
}
