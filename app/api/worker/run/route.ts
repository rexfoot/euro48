import { NextRequest, NextResponse } from "next/server";
import { MAX_VISIBLE_OFFERS } from "@/lib/constants";
import { visibleCondition, purgeableCondition } from "@/lib/visibility";
import { fetchEuresOffersForCountry, EURES_MAX_PAGE, EURES_COUNTRIES } from "@/lib/sources/eures";
import { ADZUNA_COUNTRIES, ADZUNA_MAX_PAGE, fetchAdzunaOffersForCountry } from "@/lib/sources/adzuna";
import { fetchArbeitnowOffers } from "@/lib/sources/arbeitnow";
import { fetchBundesagenturOffers } from "@/lib/sources/bundesagentur";
import { fetchJobTechOffers } from "@/lib/sources/jobtech";
import { fetchNavOffers } from "@/lib/sources/nav";
import { fetchFranceTravailOffers } from "@/lib/sources/francetravail";
import { fetchLeforemOffers } from "@/lib/sources/leforem";
import { fetchGreenhouseOffers } from "@/lib/sources/greenhouse";
import { fetchLeverOffers } from "@/lib/sources/lever";
import { fetchVisaSponsorOffers } from "@/lib/sources/visasponsor";
import { fetchEuroStaffsOffers } from "@/lib/sources/eurostaffs";
import { fetchNextLevelJobsOffers } from "@/lib/sources/nextleveljobs";
import { fetchJobbaticalOffers } from "@/lib/sources/jobbatical";
import { fetchGermanyWorkStayOffers } from "@/lib/sources/germanyworkstay";
import { upsertOffers } from "@/lib/offers";
import { query } from "@/lib/db";
import { mapWithConcurrency } from "@/lib/concurrency";
import { getCursor, setCursor } from "@/lib/worker-state";
import { makeDeadline } from "@/lib/time-budget";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const LINK_CHECK_BATCH = 15;
const COUNTRY_CONCURRENCY = 3;
const LINK_CHECK_CONCURRENCY = 5;
const EURES_TIME_BUDGET_MS = 20_000;

type CountResult = { inserted: number; skipped: number };

async function purgeExpired() {
  await query(`DELETE FROM offers WHERE ${purgeableCondition()}`);
  await query(`
    WITH ranked AS (
      SELECT id, row_number() OVER (ORDER BY published_at DESC) AS rn
      FROM offers
      WHERE ${visibleCondition()}
    )
    DELETE FROM offers WHERE id IN (SELECT id FROM ranked WHERE rn > ${MAX_VISIBLE_OFFERS})
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

// Rotates which EURES results page each country fetches, one run at a
// time, so successive 15-min runs sample a wider slice of "last 3 days"
// than always re-fetching the same top results. Time-boxed: once we're
// near the cron's 30s cutoff, remaining countries just wait for next run.
async function runEures() {
  const cursor = await getCursor<{ pageByCountry?: Record<string, number> }>("eures");
  const pageByCountry = cursor.pageByCountry ?? {};
  const isOverBudget = makeDeadline(EURES_TIME_BUDGET_MS);

  const perCountry = await mapWithConcurrency(EURES_COUNTRIES, COUNTRY_CONCURRENCY, async (country) => {
    const page = pageByCountry[country] ?? 1;
    const offers = isOverBudget() ? [] : await fetchEuresOffersForCountry(country, page, isOverBudget);
    const result = await upsertOffers(offers);
    const nextPage = (page % EURES_MAX_PAGE) + 1;
    return [country, result, nextPage] as const;
  });

  const results: Record<string, CountResult> = {};
  const nextPageByCountry: Record<string, number> = {};
  for (const [country, result, nextPage] of perCountry) {
    results[country] = result;
    nextPageByCountry[country] = nextPage;
  }
  await setCursor("eures", { pageByCountry: nextPageByCountry });
  return results;
}

const ADZUNA_SLOTS = ADZUNA_COUNTRIES.length * ADZUNA_MAX_PAGE;
const ADZUNA_SLOTS_PER_RUN = 2;

// Rotates (country, page) pairs via a DB cursor — 2 slots/run keeps us at
// ~1440 calls/month, safely under Adzuna's 2500/month free-tier cap, while
// cycling every supported country through both pages every ~4h. `country`
// lets a manual call (authenticated the same as the cron) target one
// country directly for testing, bypassing rotation.
async function runAdzuna(countryOverride?: string) {
  if (countryOverride && ADZUNA_COUNTRIES.includes(countryOverride as (typeof ADZUNA_COUNTRIES)[number])) {
    const target = countryOverride as (typeof ADZUNA_COUNTRIES)[number];
    const offers = await fetchAdzunaOffersForCountry(target, 1);
    const result = await upsertOffers(offers);
    return { [target]: result };
  }

  const cursor = await getCursor<{ index?: number }>("adzuna");
  const startIndex = cursor.index ?? 0;
  const results: Record<string, CountResult> = {};

  for (let i = 0; i < ADZUNA_SLOTS_PER_RUN; i++) {
    const slot = (startIndex + i) % ADZUNA_SLOTS;
    const country = ADZUNA_COUNTRIES[Math.floor(slot / ADZUNA_MAX_PAGE)];
    const page = (slot % ADZUNA_MAX_PAGE) + 1;
    const offers = await fetchAdzunaOffersForCountry(country, page);
    const result = await upsertOffers(offers);
    results[`${country}_p${page}`] = result;
  }

  await setCursor("adzuna", { index: (startIndex + ADZUNA_SLOTS_PER_RUN) % ADZUNA_SLOTS });
  return results;
}

async function runArbeitnow() {
  const offers = await fetchArbeitnowOffers();
  const result = await upsertOffers(offers);
  return { arbeitnow: result };
}

async function runBundesagentur() {
  const offers = await fetchBundesagenturOffers();
  const result = await upsertOffers(offers);
  return { bundesagentur: result };
}

async function runJobTech() {
  const offers = await fetchJobTechOffers();
  const result = await upsertOffers(offers);
  return { jobtech: result };
}

async function runNav() {
  const offers = await fetchNavOffers();
  const result = await upsertOffers(offers);
  return { nav: result };
}

async function runFranceTravail() {
  const offers = await fetchFranceTravailOffers();
  const result = await upsertOffers(offers);
  return { francetravail: result };
}

async function runLeforem() {
  const offers = await fetchLeforemOffers();
  const result = await upsertOffers(offers);
  return { leforem: result };
}

async function runGreenhouse() {
  const offers = await fetchGreenhouseOffers();
  const result = await upsertOffers(offers);
  return { greenhouse: result };
}

async function runLever() {
  const offers = await fetchLeverOffers();
  const result = await upsertOffers(offers);
  return { lever: result };
}

const SOURCES: Record<string, (country?: string) => Promise<Record<string, CountResult>>> = {
  eures: runEures,
  adzuna: runAdzuna,
  arbeitnow: runArbeitnow,
  bundesagentur: runBundesagentur,
  jobtech: runJobTech,
  nav: runNav,
  francetravail: runFranceTravail,
  leforem: runLeforem,
  greenhouse: runGreenhouse,
  lever: runLever,
};

const RADAR_SOURCES: Record<string, () => Promise<Record<string, CountResult>>> = {
  visasponsor: async () => ({ visasponsor: await upsertOffers(await fetchVisaSponsorOffers()) }),
  eurostaffs: async () => ({ eurostaffs: await upsertOffers(await fetchEuroStaffsOffers()) }),
  nextleveljobs: async () => ({ nextleveljobs: await upsertOffers(await fetchNextLevelJobsOffers()) }),
  jobbatical: async () => ({ jobbatical: await upsertOffers(await fetchJobbaticalOffers()) }),
  germanyworkstay: async () => ({ germanyworkstay: await upsertOffers(await fetchGermanyWorkStayOffers()) }),
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.WORKER_SECRET}`;
  if (!process.env.WORKER_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const isRadar = req.nextUrl.pathname.includes("/api/worker/radar");
  const sourceParam = req.nextUrl.searchParams.get("source");

  if (isRadar) {
    const run = sourceParam ? RADAR_SOURCES[sourceParam] : null;
    if (!run) {
      return NextResponse.json({ error: "unknown radar source" }, { status: 400 });
    }
    const results = await run();
    return NextResponse.json({ status: "ok", source: sourceParam, results });
  }

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
