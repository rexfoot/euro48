import { NextRequest, NextResponse } from "next/server";
import { fetchJoobleGulfOffers } from "@/lib/sources/jooble";
import { upsertGulfOffers } from "@/lib/gulf-offers";
import { GULF_COUNTRY_CODES, type GulfCountryCode } from "@/lib/gulf-constants";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isGulfCountryCode(v: string | null): v is GulfCountryCode {
  return !!v && GULF_COUNTRY_CODES.includes(v as GulfCountryCode);
}

// Separate endpoint from /api/worker/run and /api/worker/radar on purpose —
// this section (lib/gulf-offers.ts) never touches the `offers` table, so
// there's zero chance of this route's errors affecting the EU 48h radar or
// RADAR HORS UE.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.WORKER_SECRET}`;
  if (!process.env.WORKER_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const countryParam = req.nextUrl.searchParams.get("country");
  const targets = isGulfCountryCode(countryParam) ? [countryParam] : GULF_COUNTRY_CODES;

  const results: Record<string, { inserted: number; skipped: number }> = {};
  for (const country of targets) {
    const offers = await fetchJoobleGulfOffers(country);
    results[country] = await upsertGulfOffers(offers);
  }

  return NextResponse.json({ status: "ok", results });
}
