import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_CODES } from "@/lib/constants";
import { fetchEuresOffersForCountry } from "@/lib/sources/eures";
import { ADZUNA_COUNTRIES, fetchAdzunaOffersForCountry } from "@/lib/sources/adzuna";
import { fetchArbeitnowOffers } from "@/lib/sources/arbeitnow";
import { upsertOffers } from "@/lib/offers";
import { query } from "@/lib/db";
import { mapWithConcurrency } from "@/lib/concurrency";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const LINK_CHECK_BATCH = 15;
const COUNTRY_CONCURRENCY = 3;
const LINK_CHECK_CONCURRENCY = 5;

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

  const results = await mapWithConcurrency(candidates, LINK_CHECK_CONCURRENCY, async (offer) => {
    try {
      const res = await fetch(offer.url, { method: "HEAD", redirect: "follow" });
      if (res.status === 404 || res.status === 410) {
        await query(`DELETE FROM offers WHERE id = $1`, [offer.id]);
        return true;
      }
    } catch {
      // network hiccup — leave it, will be re-checked next run
    }
    return false;
  });

  return results.filter(Boolean).length;
}

async function runEures() {
  const perCountry = await mapWithConcurrency(COUNTRY_CODES, COUNTRY_CONCURRENCY, async (country) => {
    const offers = await fetchEuresOffersForCountry(country);
    const result = await upsertOffers(offers);
    return [country, result] as const;
  });
  return Object.fromEntries(perCountry);
}

// One Adzuna country per call, rotated hourly (stateless: derived from the
// clock) to respect the free-tier's 2500/month cap while still cycling
// through all 8 supported countries every 8 hours. `country` lets a manual
// call (authenticated the same as the cron) target one country for testing.
async function runAdzuna(country?: string) {
  const target =
    country && ADZUNA_COUNTRIES.includes(country as (typeof ADZUNA_COUNTRIES)[number])
      ? (country as (typeof ADZUNA_COUNTRIES)[number])
      : ADZUNA_COUNTRIES[Math.floor(Date.now() / 3_600_000) % ADZUNA_COUNTRIES.length];
  const offers = await fetchAdzunaOffersForCountry(target);
  const result = await upsertOffers(offers);
  return { [target]: result };
}

async function runArbeitnow() {
  const offers = await fetchArbeitnowOffers();
  const result = await upsertOffers(offers);
  return { arbeitnow: result };
}

const SOURCES: Record<string, (country?: string) => Promise<Record<string, { inserted: number; skipped: number }>>> = {
  eures: runEures,
  adzuna: runAdzuna,
  arbeitnow: runArbeitnow,
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.WORKER_SECRET}`;
  if (!process.env.WORKER_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sourceParam = req.nextUrl.searchParams.get("source");
  const run = sourceParam ? SOURCES[sourceParam] : SOURCES.eures;
  if (!run) {
    return NextResponse.json({ error: "unknown source" }, { status: 400 });
  }

  const countryParam = req.nextUrl.searchParams.get("country") ?? undefined;
  const results = await run(countryParam);

  const deadLinksRemoved = await purgeDeadLinks();
  await purgeExpired();

  return NextResponse.json({ status: "ok", source: sourceParam ?? "eures", results, deadLinksRemoved });
}
