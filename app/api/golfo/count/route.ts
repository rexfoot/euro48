import { NextResponse } from "next/server";
import { countGulfOffers } from "@/lib/gulf-offers";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ count: await countGulfOffers() });
}
