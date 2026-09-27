// Real land/sea/border geometry for the mobile-facing 2D map (spec
// 2026-09-27: "un mapa de verdad", not the old abstract grid). Natural
// Earth data (public domain) via world-atlas, rendered as static SVG paths
// — no WebGL, no tiles, no network request at render time, so it stays as
// light as the grid it replaces.
import { geoBounds, geoMercator, geoPath, type GeoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { Topology, GeometryCollection } from "topojson-specification";
import topology from "world-atlas/countries-110m.json";
import { CITIES, type CountryCode } from "./constants";
import { LANDMARKS } from "./landmarks";

export const MAP_WIDTH = 600;
export const MAP_HEIGHT = 520;
const PADDING = 26;

// Generous enough to pull in neighbouring countries for visual context
// (UK, Poland, North Africa's coast...) — anything outside this still
// gets fetched into the dataset if a country's bounding box merely
// overlaps it (e.g. Turkey), but then lands off the fitted view below and
// is never actually drawn.
const CONTEXT_REGION = { lonMin: -26, lonMax: 32, latMin: 29, latMax: 72 };

function buildProjection(): GeoProjection {
  const points: [number, number][] = [
    ...Object.values(CITIES).map((c) => [c.lng, c.lat] as [number, number]),
    ...LANDMARKS.map((l) => [l.lng, l.lat] as [number, number]),
  ];
  // Fit to our own known points, not the raw country polygons — this
  // dataset's "France" geometry, for one, bundles French Guiana into the
  // same multi-polygon, which would badly skew a fit based on geometry
  // bounds instead.
  const collection: FeatureCollection = {
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "MultiPoint", coordinates: points } }],
  };
  return geoMercator().fitExtent(
    [
      [PADDING, PADDING],
      [MAP_WIDTH - PADDING, MAP_HEIGHT - PADDING],
    ],
    collection
  );
}

export const europeProjection: GeoProjection = buildProjection();
// .digits(2): Mercator's log/tan math can differ in the last float ULP
// between the server's and the browser's math library, which otherwise
// shows up as a React hydration mismatch on every rendered coordinate —
// rounding removes it while staying far more precise than this map is ever
// viewed at.
export const europePath: GeoPath = geoPath(europeProjection).digits(2);

export function projectPoint(lng: number, lat: number): [number, number] {
  const [x, y] = europeProjection([lng, lat]) ?? [0, 0];
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

const worldTopology = topology as unknown as Topology<{
  countries: GeometryCollection<{ name: string }>;
  land: GeometryCollection;
}>;

const allCountries = feature(worldTopology, worldTopology.objects.countries) as FeatureCollection<
  MultiPolygon | Polygon,
  { name: string }
>;

function overlapsContextRegion(f: Feature<MultiPolygon | Polygon>): boolean {
  const [[west, south], [east, north]] = geoBounds(f);
  return west <= CONTEXT_REGION.lonMax && east >= CONTEXT_REGION.lonMin && south <= CONTEXT_REGION.latMax && north >= CONTEXT_REGION.latMin;
}

// Every ISO-3166 numeric id in `topology.objects.countries` for our 15
// supported countries, verified directly against this exact dataset
// (2026-09-27) — GeoJSON country id, not our own CountryCode.
const SUPPORTED_NUMERIC_IDS: Partial<Record<string, CountryCode>> = {
  "276": "DE", "528": "NL", "756": "CH", "442": "LU", "056": "BE",
  "040": "AT", "372": "IE", "250": "FR", "724": "ES", "380": "IT",
  "578": "NO", "208": "DK", "752": "SE", "246": "FI", "352": "IS",
};

export type MapCountry = { code: CountryCode | null; path: string };

// Only the countries actually visible in our fitted Europe view (roughly
// 30-40 of the 177 in the full dataset) — keeps the SVG payload light
// instead of shipping every landmass on Earth just to clip most of it away.
export const mapCountries: MapCountry[] = allCountries.features
  .filter(overlapsContextRegion)
  .map((f) => ({
    code: SUPPORTED_NUMERIC_IDS[String(f.id)] ?? null,
    path: europePath(f) ?? "",
  }))
  .filter((c) => c.path.length > 0);
