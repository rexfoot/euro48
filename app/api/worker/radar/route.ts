import { NextRequest, NextResponse } from "next/server";
import { upsertOffers } from "@/lib/offers";
import { fetchVisaSponsorOffers } from "@/lib/sources/visasponsor";
import { fetchEuroStaffsOffers } from "@/lib/sources/eurostaffs";
import { fetchNextLevelJobsOffers } from "@/lib/sources/nextleveljobs";
import { fetchJobbaticalOffers } from "@/lib/sources/jobbatical";
import { fetchGermanyWorkStayOffers } from "@/lib/sources/germanyworkstay";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const RADAR_SOURCES: Record<string, () => Promise<{ inserted: number; skipped: number }>> = {
  visasponsor: fetchVisaSponsorOffers,
  eurostaffs: fetchEuroStaffsOffers,
  nextleveljobs: fetchNextLevelJobsOffers,
  jobbatical: fetchJobbaticalOffers,
  germanyworkstay: fetchGermanyWorkStayOffers,
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.WORKER_SECRET}`;
  if (!process.env.WORKER_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sourceParam = req.nextUrl.searchParams.get("source");
  const run = sourceParam ? RADAR_SOURCES[sourceParam] : null;
  if (!run) {
    return NextResponse.json({ error: "unknown radar source" }, { status: 400 });
  }

  const offers = await run();
  const result = await upsertOffers(offers);

  return NextResponse.json({ status: "ok", source: sourceParam, result });
}
