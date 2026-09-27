// The mobile-facing map is a real satellite photo (NASA Blue Marble, public
// domain — see scripts/generate-europe-map.ts for provenance and how
// public/images/europe-satellite.jpg was cropped) instead of a drawn map,
// so all this needs to do is turn a lng/lat into a % position over that
// image — a plain equirectangular (linear) mapping, matching the photo's
// own projection exactly. These bounds are baked into that crop; changing
// them here means re-running the generation script.
export const EUROPE_MAP_BOUNDS = { lonMin: -28, lonMax: 34, latMin: 27, latMax: 73 };

export function toMapPercent(lng: number, lat: number): { xPct: number; yPct: number } {
  const { lonMin, lonMax, latMin, latMax } = EUROPE_MAP_BOUNDS;
  return {
    xPct: ((lng - lonMin) / (lonMax - lonMin)) * 100,
    yPct: ((latMax - lat) / (latMax - latMin)) * 100,
  };
}
