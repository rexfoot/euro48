// Data layer for the "Golfo" section (2026-10-02). Deliberately its own
// table, not the shared `offers` table: offers_country_code_allowed is a DB
// CHECK constraint hard-limited to the 18 EU/EEA codes (spec section 12),
// so Gulf country codes couldn't be inserted there even by mistake. This
// keeps the EU 48h radar and RADAR HORS UE completely untouched.

import { query } from "./db";
import { buildFingerprint } from "./fingerprint";
import type { GulfOffer } from "./sources/jooble";
import { GULF_COUNTRY_CODES, type GulfCountryCode } from "./gulf-constants";
import type { SpecialtyId } from "./constants";

export type GulfOfferRow = {
  id: string;
  title_original: string;
  company: string;
  country_code: GulfCountryCode;
  city: string;
  specialty: SpecialtyId;
  url: string;
  source: string;
  published_at: string;
  created_at: string;
};

const MAX_VISIBLE_GULF_OFFERS = 1000;

export async function upsertGulfOffers(offers: GulfOffer[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;

  for (const offer of offers) {
    if (!GULF_COUNTRY_CODES.includes(offer.countryCode)) {
      skipped++;
      continue;
    }

    const fingerprint = buildFingerprint({
      company: offer.company,
      title: offer.titleOriginal,
      city: offer.city,
      countryCode: offer.countryCode,
    });

    const rows = await query(
      `INSERT INTO gulf_offers (
         id, title_original, company, country_code, city, specialty, url, source, published_at, fingerprint
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (fingerprint) DO UPDATE SET
         title_original = EXCLUDED.title_original,
         url = EXCLUDED.url,
         source = EXCLUDED.source,
         published_at = EXCLUDED.published_at
       WHERE EXCLUDED.published_at > gulf_offers.published_at
       RETURNING id`,
      [
        offer.id,
        offer.titleOriginal,
        offer.company,
        offer.countryCode,
        offer.city,
        offer.specialty,
        offer.url,
        offer.source,
        offer.publishedAt.toISOString(),
        fingerprint,
      ]
    );
    if (rows.length > 0) inserted++;
    else skipped++;
  }

  // No 48h/72h rule here (that's the EU radar's spec, not this section) —
  // just cap total rows so the table can't grow unbounded, evicting oldest.
  await query(
    `WITH ranked AS (
       SELECT id, row_number() OVER (ORDER BY published_at DESC) AS rn FROM gulf_offers
     )
     DELETE FROM gulf_offers WHERE id IN (SELECT id FROM ranked WHERE rn > $1)`,
    [MAX_VISIBLE_GULF_OFFERS]
  );

  return { inserted, skipped };
}

export async function getVisibleGulfOffers(limit = 500): Promise<GulfOfferRow[]> {
  return query<GulfOfferRow>(
    `SELECT * FROM gulf_offers ORDER BY published_at DESC LIMIT $1`,
    [Math.min(limit, MAX_VISIBLE_GULF_OFFERS)]
  );
}

export async function countGulfOffers(): Promise<number> {
  const rows = await query<{ count: string }>(`SELECT count(*) FROM gulf_offers`);
  return Number(rows[0]?.count ?? 0);
}
