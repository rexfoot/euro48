import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_CODES } from "@/lib/constants";
import { fetchEuresOffersForCountry } from "@/lib/sources/eures";
import { upsertOffers } from "@/lib/offers";
import { query } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const LINK_CHECK_BATCH = 15;

async function purgeExpired() {
  await query(`DELETE FROM offers WHERE published_at < now() - interval '72 hours'`);
  await query(`
    WITH ranked AS (
      SELECT id, row_number() OVER (ORDER BY published_at DESC) AS rn
      FROM offers
      WHERE published_at >= now() - interval '48 hours'
    )
    DELETE FROM offers WHERE id IN (SELECT id FROM ranked WHERE rn > 2000)
  `);
}

async function purgeDeadLinks() {
  const candidates = await query<{ id: string; url: string }>(
    `SELECT id, url FROM offers ORDER BY created_at ASC LIMIT $1`,
    [LINK_CHECK_BATCH]
  );
  let removed = 0;
  for (const offer of candidates) {
    try {
      const res = await fetch(offer.url, { method: "HEAD", redirect: "follow" });
      if (res.status === 404 || res.status === 410) {
        await query(`DELETE FROM offers WHERE id = $1`, [offer.id]);
        removed++;
      }
    } catch {
      // network hiccup — leave it, will be re-checked next run
    }
  }
  return removed;
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.WORKER_SECRET}`;
  if (!process.env.WORKER_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const results: Record<string, { inserted: number; skipped: number }> = {};

  for (const country of COUNTRY_CODES) {
    const offers = await fetchEuresOffersForCountry(country);
    results[country] = await upsertOffers(offers);
  }

  const deadLinksRemoved = await purgeDeadLinks();
  await purgeExpired();

  return NextResponse.json({ status: "ok", results, deadLinksRemoved });
}
