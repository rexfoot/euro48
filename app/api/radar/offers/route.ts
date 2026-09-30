import { NextResponse } from "next/server";
import { getVisibleOffers } from "@/lib/offers";
import { classifyOffer } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

export async function GET() {
  const offers = await getVisibleOffers({ limit: 2000 });

  const radarOffers = offers
    .map(offer => {
      const result = classifyOffer(offer.title_original, offer.description ?? "");
      return { ...offer, status: result.status, professionId: result.professionId };
    })
    .filter(r => r.status === "A" || r.status === "B");

  return NextResponse.json({ offers: radarOffers });
}
