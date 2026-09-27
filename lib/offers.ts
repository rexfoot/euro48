import { cache } from "react";
import { query } from "./db";
import { buildFingerprint } from "./fingerprint";
import { COUNTRY_CODES, OTHER_CITY, SPECIALTY_IDS, MAX_VISIBLE_OFFERS, URGENT_KEYWORDS, type CountryCode, type SpecialtyId } from "./constants";
import { visibleCondition } from "./visibility";

export type Offer = {
  id: string;
  title_original: string;
  title_en: string;
  title_fr: string;
  title_es: string;
  company: string;
  country_code: CountryCode;
  city: string;
  city_lat: number | null;
  city_lng: number | null;
  specialty: SpecialtyId;
  contract_type: string | null;
  salary_raw: string | null;
  remote: boolean;
  language_of_ad: string;
  url: string;
  source: string;
  published_at: string;
  fingerprint: string;
  created_at: string;
  // Both added 2026-09-28 for the admin panel's manual offers — NULL for
  // every offer from a scraped source.
  description: string | null;
  expires_at: string | null;
};

export type NewOffer = {
  id: string;
  titleOriginal: string;
  titleEn: string;
  titleFr: string;
  titleEs: string;
  company: string;
  countryCode: CountryCode;
  city: string;
  cityLat?: number | null;
  cityLng?: number | null;
  specialty: SpecialtyId;
  contractType?: string | null;
  salaryRaw?: string | null;
  remote?: boolean;
  languageOfAd: string;
  url: string;
  source: string;
  publishedAt: Date;
  description?: string | null;
  expiresAt?: Date | null;
};

export async function getVisibleOffers(filters: {
  country?: CountryCode;
  city?: string;
  specialty?: SpecialtyId;
  q?: string;
  limit?: number;
} = {}): Promise<Offer[]> {
  const conditions: string[] = [visibleCondition()];
  const params: unknown[] = [];

  if (filters.country) {
    params.push(filters.country);
    conditions.push(`country_code = $${params.length}`);
  }
  if (filters.city) {
    params.push(filters.city);
    conditions.push(`city = $${params.length}`);
  }
  if (filters.specialty) {
    params.push(filters.specialty);
    conditions.push(`specialty = $${params.length}`);
  }
  if (filters.q) {
    // Title in any of the 3 UI languages, or the company — a keyword
    // search doesn't need to know which language the ad or the query is in.
    params.push(`%${filters.q.replace(/[%_]/g, "\\$&")}%`);
    const p = params.length;
    conditions.push(
      `(title_original ILIKE $${p} ESCAPE '\\' OR title_en ILIKE $${p} ESCAPE '\\' OR title_fr ILIKE $${p} ESCAPE '\\' OR title_es ILIKE $${p} ESCAPE '\\' OR company ILIKE $${p} ESCAPE '\\')`
    );
  }

  const limit = Math.min(filters.limit ?? 200, MAX_VISIBLE_OFFERS);
  params.push(limit);

  const rows = await query<Offer>(
    `SELECT * FROM offers WHERE ${conditions.join(" AND ")} ORDER BY published_at DESC LIMIT $${params.length}`,
    params
  );

  // Defense in depth: the fingerprint UNIQUE constraint should already make
  // this a no-op, but never show the same job twice even if that's ever
  // bypassed (e.g. a fingerprint algorithm change mid-flight).
  return dedupeByFingerprint(rows);
}

function dedupeByFingerprint(offers: Offer[]): Offer[] {
  const seen = new Set<string>();
  const result: Offer[] = [];
  for (const offer of offers) {
    if (seen.has(offer.fingerprint)) continue;
    seen.add(offer.fingerprint);
    result.push(offer);
  }
  return result;
}

// Wrapped in React's cache() so generateMetadata and the page body — both
// looking up the same offer for the same request — share one DB query.
export const getOfferById = cache(async (id: string): Promise<Offer | null> => {
  const rows = await query<Offer>(`SELECT * FROM offers WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ?? null;
});

// Every currently-active (country, city, specialty) combination — cities
// are open now, so the sitemap can't enumerate a fixed list; it needs to
// ask the DB which ones actually have offers right now.
export async function getActiveLocationBreakdown(): Promise<
  { country_code: CountryCode; city: string; specialty: SpecialtyId }[]
> {
  return query(
    `SELECT DISTINCT country_code, city, specialty FROM offers
     WHERE ${visibleCondition()}`
  );
}

// Cities that currently have offers, with their coordinates — for the "no
// offers here, try nearby" empty state (real distance, see lib/city-index).
export async function getActiveCitiesWithCoords(
  country: CountryCode
): Promise<{ city: string; lat: number; lng: number; count: number }[]> {
  return query(
    `SELECT city, city_lat AS lat, city_lng AS lng, count(*)::int AS count
     FROM offers
     WHERE country_code = $1 AND ${visibleCondition()}
       AND city_lat IS NOT NULL AND city_lng IS NOT NULL AND city != $2
     GROUP BY city, city_lat, city_lng`,
    [country, OTHER_CITY]
  );
}

export async function countVisibleOffers(): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT count(*) FROM offers WHERE ${visibleCondition()}`
  );
  return Number(rows[0]?.count ?? 0);
}

export function isUrgent(title: string, publishedAt: Date): boolean {
  const hoursOld = (Date.now() - publishedAt.getTime()) / 3_600_000;
  if (hoursOld >= 24) return false;
  const normalized = title.toLowerCase();
  return URGENT_KEYWORDS.some((kw) => normalized.includes(kw));
}

// Upsert a batch of offers. Duplicates (same fingerprint) keep the freshest
// row (spec: "garder 1 seule offre (la plus fraîche + lien le plus direct)").
export async function upsertOffers(offers: NewOffer[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  const seenIds = new Set<string>();

  for (const offer of offers) {
    // Same literal id observed twice in one batch (e.g. two nearby-city
    // radius searches both matching the same posting) — the first pass
    // already handles it; a second INSERT with the same id but a
    // different fingerprint would hit the primary key, not the
    // fingerprint conflict target, and crash the whole batch.
    if (seenIds.has(offer.id)) {
      skipped++;
      continue;
    }
    seenIds.add(offer.id);

    if (!COUNTRY_CODES.includes(offer.countryCode)) {
      skipped++;
      continue;
    }
    // City is open (2026-09-26): any real place name from a source is
    // accepted (see lib/classify.ts#resolveCity) — only country and specialty stay
    // closed lists.
    if (!SPECIALTY_IDS.includes(offer.specialty)) {
      skipped++;
      continue;
    }

    const fingerprint = buildFingerprint({
      company: offer.company,
      title: offer.titleOriginal,
      city: offer.city,
      countryCode: offer.countryCode,
    });

    const values = [
      offer.id,
      offer.titleOriginal,
      offer.titleEn,
      offer.titleFr,
      offer.titleEs,
      offer.company,
      offer.countryCode,
      offer.city,
      offer.specialty,
      offer.contractType ?? null,
      offer.salaryRaw ?? null,
      offer.remote ?? false,
      offer.languageOfAd,
      offer.url,
      offer.source,
      offer.publishedAt.toISOString(),
      fingerprint,
      offer.cityLat ?? null,
      offer.cityLng ?? null,
      offer.description ?? null,
      offer.expiresAt ? offer.expiresAt.toISOString() : null,
    ];

    try {
      const rows = await query(
        `INSERT INTO offers (
           id, title_original, title_en, title_fr, title_es, company,
           country_code, city, specialty, contract_type, salary_raw, remote,
           language_of_ad, url, source, published_at, fingerprint, city_lat, city_lng,
           description, expires_at
         ) VALUES (
           $1::text, $2::text, $3::text, $4::text, $5::text, $6::text,
           $7::text, $8::text, $9::text, $10::text, $11::text, $12::boolean,
           $13::text, $14::text, $15::text, $16::timestamptz, $17::text, $18::double precision, $19::double precision,
           $20::text, $21::timestamptz
         )
         ON CONFLICT (fingerprint) DO UPDATE SET
           title_original = EXCLUDED.title_original,
           title_en = EXCLUDED.title_en,
           title_fr = EXCLUDED.title_fr,
           title_es = EXCLUDED.title_es,
           url = EXCLUDED.url,
           source = EXCLUDED.source,
           published_at = EXCLUDED.published_at,
           contract_type = EXCLUDED.contract_type,
           salary_raw = EXCLUDED.salary_raw,
           remote = EXCLUDED.remote,
           city_lat = EXCLUDED.city_lat,
           city_lng = EXCLUDED.city_lng,
           description = EXCLUDED.description,
           expires_at = EXCLUDED.expires_at
         WHERE EXCLUDED.published_at > offers.published_at
         RETURNING id`,
        values
      );
      if (rows.length > 0) inserted++;
      else skipped++;
    } catch (err) {
      // Same id, different fingerprint: happens when the same posting is
      // re-observed under a different matched city (e.g. two cities'
      // radius searches overlapping, or a city-matching improvement
      // resolving it differently than a previous run did) in a later run
      // than the one that first stored it. The fingerprint conflict
      // target above can't also catch a primary-key collision, so handle
      // it explicitly instead of letting the whole batch crash.
      //
      // This UPDATE must reference every placeholder with an explicit
      // cast: any $n that appears nowhere in the query text (previously
      // $6/$7/$13 were skipped) leaves Postgres with zero type context for
      // it and it fails the whole query with "could not determine data
      // type of parameter $n" (42P18) — not just skip that column.
      const isPkConflict =
        (err as { code?: string; constraint?: string }).code === "23505" &&
        (err as { code?: string; constraint?: string }).constraint === "offers_pkey";
      if (!isPkConflict) throw err;

      await query(
        `UPDATE offers SET
           title_original = $2::text,
           title_en = $3::text,
           title_fr = $4::text,
           title_es = $5::text,
           company = $6::text,
           country_code = $7::text,
           city = $8::text,
           specialty = $9::text,
           contract_type = $10::text,
           salary_raw = $11::text,
           remote = $12::boolean,
           language_of_ad = $13::text,
           url = $14::text,
           source = $15::text,
           published_at = $16::timestamptz,
           fingerprint = $17::text,
           city_lat = $18::double precision,
           city_lng = $19::double precision,
           description = $20::text,
           expires_at = $21::timestamptz
         WHERE id = $1::text AND $16::timestamptz > published_at`,
        values
      );
      skipped++;
    }
  }

  return { inserted, skipped };
}
