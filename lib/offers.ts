import { query } from "./db";
import { buildFingerprint } from "./fingerprint";
import { CITIES, COUNTRY_CODES, SPECIALTY_IDS, OFFER_VISIBLE_HOURS, URGENT_KEYWORDS, type CountryCode, type SpecialtyId } from "./constants";

export type Offer = {
  id: string;
  title_original: string;
  title_en: string;
  title_fr: string;
  title_es: string;
  company: string;
  country_code: CountryCode;
  city: string;
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
  specialty: SpecialtyId;
  contractType?: string | null;
  salaryRaw?: string | null;
  remote?: boolean;
  languageOfAd: string;
  url: string;
  source: string;
  publishedAt: Date;
};

export async function getVisibleOffers(filters: {
  country?: CountryCode;
  city?: string;
  specialty?: SpecialtyId;
  limit?: number;
} = {}): Promise<Offer[]> {
  const conditions: string[] = [`published_at >= now() - interval '${OFFER_VISIBLE_HOURS} hours'`];
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

  const limit = Math.min(filters.limit ?? 200, 2000);
  params.push(limit);

  return query<Offer>(
    `SELECT * FROM offers WHERE ${conditions.join(" AND ")} ORDER BY published_at DESC LIMIT $${params.length}`,
    params
  );
}

export async function getOfferById(id: string): Promise<Offer | null> {
  const rows = await query<Offer>(`SELECT * FROM offers WHERE id = $1 LIMIT 1`, [id]);
  return rows[0] ?? null;
}

export async function countVisibleOffers(): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT count(*) FROM offers WHERE published_at >= now() - interval '${OFFER_VISIBLE_HOURS} hours'`
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

  for (const offer of offers) {
    if (!COUNTRY_CODES.includes(offer.countryCode)) {
      skipped++;
      continue;
    }
    if (!(offer.city in CITIES) || CITIES[offer.city as keyof typeof CITIES].country !== offer.countryCode) {
      skipped++;
      continue;
    }
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

    const rows = await query(
      `INSERT INTO offers (
         id, title_original, title_en, title_fr, title_es, company,
         country_code, city, specialty, contract_type, salary_raw, remote,
         language_of_ad, url, source, published_at, fingerprint
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
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
         remote = EXCLUDED.remote
       WHERE EXCLUDED.published_at > offers.published_at
       RETURNING id`,
      [
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
      ]
    );

    if (rows.length > 0) inserted++;
    else skipped++;
  }

  return { inserted, skipped };
}
