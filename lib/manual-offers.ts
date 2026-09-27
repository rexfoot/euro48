import { randomUUID } from "crypto";
import { query } from "./db";
import { buildFingerprint } from "./fingerprint";
import { resolveCity } from "./classify";
import { getCityIndex } from "./city-index";
import { upsertOffers, type Offer } from "./offers";
import { COUNTRY_CODES, SPECIALTY_IDS, LANGUAGE_BY_COUNTRY, type CountryCode, type SpecialtyId } from "./constants";

const MANUAL_SOURCE = "manual";
const VISIBILITY_DAYS = [7, 15, 30] as const;
export type VisibilityDays = (typeof VISIBILITY_DAYS)[number];

export type ManualOfferInput = {
  title: string;
  company: string;
  countryCode: CountryCode;
  city: string;
  specialty: SpecialtyId;
  contact: string; // raw "link or email or phone" text from the form
  description: string | null;
  visibilityDays: VisibilityDays | null; // null = default 48h rule
};

// One free-text field covers link/email/phone (spec 2026-09-28) — offer.url
// is NOT NULL and every existing renderer already does a plain
// `<a href={offer.url}>`, and mailto:/tel: hrefs just work there natively,
// so no display code needs to know which kind this is.
export function normalizeContact(raw: string): string {
  const trimmed = raw.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
  if (/^[+\d][\d\s().-]{5,}$/.test(trimmed)) return `tel:${trimmed.replace(/[\s().-]/g, "")}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function expiresAtFor(days: VisibilityDays | null): Date | null {
  if (!days) return null;
  return new Date(Date.now() + days * 24 * 3_600_000);
}

function validate(input: ManualOfferInput): string | null {
  if (!input.title.trim()) return "title";
  if (!input.company.trim()) return "company";
  if (!input.city.trim()) return "city";
  if (!input.contact.trim()) return "contact";
  if (!COUNTRY_CODES.includes(input.countryCode)) return "countryCode";
  if (!SPECIALTY_IDS.includes(input.specialty)) return "specialty";
  if (input.visibilityDays !== null && !VISIBILITY_DAYS.includes(input.visibilityDays)) return "visibilityDays";
  return null;
}

export async function createManualOffer(input: ManualOfferInput): Promise<{ error: string } | { ok: true }> {
  const invalidField = validate(input);
  if (invalidField) return { error: invalidField };

  const cityIndex = await getCityIndex();
  const { city, lat, lng } = resolveCity(cityIndex, [input.city.trim()], input.countryCode);
  const title = input.title.trim();
  const company = input.company.trim();

  const result = await upsertOffers([
    {
      id: `manual:${randomUUID()}`,
      titleOriginal: title,
      titleEn: title,
      titleFr: title,
      titleEs: title,
      company,
      countryCode: input.countryCode,
      city,
      cityLat: lat,
      cityLng: lng,
      specialty: input.specialty,
      languageOfAd: LANGUAGE_BY_COUNTRY[input.countryCode] ?? "en",
      url: normalizeContact(input.contact),
      source: MANUAL_SOURCE,
      publishedAt: new Date(),
      description: input.description,
      expiresAt: expiresAtFor(input.visibilityDays),
    },
  ]);

  if (result.inserted === 0) return { error: "duplicate" };
  return { ok: true };
}

export async function listManualOffers(): Promise<Offer[]> {
  return query<Offer>(`SELECT * FROM offers WHERE source = $1 ORDER BY created_at DESC`, [MANUAL_SOURCE]);
}

export async function deleteManualOffer(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `DELETE FROM offers WHERE id = $1 AND source = $2 RETURNING id`,
    [id, MANUAL_SOURCE]
  );
  return rows.length > 0;
}

export async function updateManualOffer(
  id: string,
  input: ManualOfferInput
): Promise<{ error: string } | { ok: true }> {
  const invalidField = validate(input);
  if (invalidField) return { error: invalidField };

  const cityIndex = await getCityIndex();
  const { city, lat, lng } = resolveCity(cityIndex, [input.city.trim()], input.countryCode);
  const title = input.title.trim();
  const company = input.company.trim();
  const url = normalizeContact(input.contact);
  const fingerprint = buildFingerprint({ company, title, city, countryCode: input.countryCode });

  try {
    const rows = await query<{ id: string }>(
      `UPDATE offers SET
         title_original = $3, title_en = $3, title_fr = $3, title_es = $3,
         company = $4, country_code = $5, city = $6, city_lat = $7, city_lng = $8,
         specialty = $9, language_of_ad = $10, url = $11, description = $12,
         expires_at = $13, fingerprint = $14
       WHERE id = $1 AND source = $2
       RETURNING id`,
      [
        id,
        MANUAL_SOURCE,
        title,
        company,
        input.countryCode,
        city,
        lat,
        lng,
        input.specialty,
        LANGUAGE_BY_COUNTRY[input.countryCode] ?? "en",
        url,
        input.description,
        expiresAtFor(input.visibilityDays),
        fingerprint,
      ]
    );
    if (rows.length === 0) return { error: "not_found" };
    return { ok: true };
  } catch (err) {
    // Edited into matching another offer's exact company+title+city+country
    // (extremely unlikely for a handful of hand-curated entries) — surface
    // a clear error instead of a raw constraint-violation crash.
    if ((err as { code?: string }).code === "23505") return { error: "duplicate" };
    throw err;
  }
}
