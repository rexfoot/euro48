import type { Metadata } from "next";
import { getVisibleGulfOffers } from "@/lib/gulf-offers";
import { pageAlternates } from "@/lib/seo";
import { GolfoPageContent } from "@/components/GolfoPageContent";

export const metadata: Metadata = {
  title: "GOLFO — Euro48",
  description: "Offres d'emploi réelles aux Émirats, en Arabie saoudite, au Qatar, au Koweït, à Bahreïn et à Oman.",
  alternates: pageAlternates("/golfo"),
};

export const revalidate = 60;

export default async function GolfoPage() {
  const offers = await getVisibleGulfOffers();
  return <GolfoPageContent offers={offers} />;
}
