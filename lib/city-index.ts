import { query } from "./db";
import { normalizeForFingerprint } from "./fingerprint";
import type { CountryCode } from "./constants";

export type CityRecord = {
  name: string;
  country: CountryCode;
  lat: number;
  lng: number;
  population: number;
};

// Per-country maps so a source that already knows its country (EURES,
// Adzuna...) never gets a same-named town from a different country by
// mistake; `global` (population wins ties across countries) is only for
// Arbeitnow, which has no country field to scope by in the first place.
export type CityIndex = {
  global: Map<string, CityRecord>;
  byCountry: Map<CountryCode, Map<string, CityRecord>>;
};

type CityRow = {
  name: string;
  ascii_name: string;
  alt_names: string | null;
  country_code: CountryCode;
  population: number;
  lat: number;
  lng: number;
};

declare global {
  // eslint-disable-next-line no-var
  var _euro48CityIndex: { index: CityIndex; loadedAt: number } | undefined;
}

const TTL_MS = 60 * 60_000; // GeoNames data is static — an hour of staleness is fine

function addTo(map: Map<string, CityRecord>, key: string, record: CityRecord) {
  const existing = map.get(key);
  if (!existing || record.population > existing.population) map.set(key, record);
}

async function buildCityIndex(): Promise<CityIndex> {
  const rows = await query<CityRow>(`SELECT name, ascii_name, alt_names, country_code, population, lat, lng FROM cities`);
  const global_ = new Map<string, CityRecord>();
  const byCountry = new Map<CountryCode, Map<string, CityRecord>>();

  for (const row of rows) {
    const record: CityRecord = { name: row.name, country: row.country_code, lat: row.lat, lng: row.lng, population: row.population };
    const names = [row.name, row.ascii_name, ...(row.alt_names ? row.alt_names.split(",") : [])];

    let countryMap = byCountry.get(row.country_code);
    if (!countryMap) {
      countryMap = new Map();
      byCountry.set(row.country_code, countryMap);
    }

    for (const raw of names) {
      const key = normalizeForFingerprint(raw);
      if (!key) continue;
      addTo(global_, key, record);
      addTo(countryMap, key, record);
    }
  }

  return { global: global_, byCountry };
}

// Cached per warm serverless instance — every worker source calls this once
// per run rather than re-querying/re-indexing ~44k rows on every offer.
export async function getCityIndex(): Promise<CityIndex> {
  const cached = global._euro48CityIndex;
  if (cached && Date.now() - cached.loadedAt < TTL_MS) return cached.index;

  const index = await buildCityIndex();
  global._euro48CityIndex = { index, loadedAt: Date.now() };
  return index;
}

// Looks up one city's own coordinates directly (e.g. the city a visitor
// is looking at, which may have zero current offers and so never came
// through resolveCity itself).
export async function getCityCoords(name: string, country: CountryCode): Promise<{ lat: number; lng: number } | null> {
  const rows = await query<{ lat: number; lng: number }>(
    `SELECT lat, lng FROM cities WHERE country_code = $1 AND (name = $2 OR ascii_name = $2) LIMIT 1`,
    [country, name]
  );
  return rows[0] ?? null;
}

// Haversine distance in km — used for the "no offers here, try nearby"
// empty state (real distance, not a guess).
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
