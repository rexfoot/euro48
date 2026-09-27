// One-off (re-)generation of public/images/europe-satellite.jpg — run with
// `npx tsx scripts/generate-europe-map.ts` whenever EUROPE_MAP_BOUNDS in
// lib/europe-geo.ts changes.
//
// Source: NASA's Blue Marble (public domain, MODIS true-color composite,
// NASA Earth Observatory) — used here via the copy already bundled in our
// own `three-globe` dependency (node_modules/three-globe/example/img/
// earth-blue-marble.jpg, a 4096x2048 equirectangular full-world image),
// the same texture already used for the desktop WebGL globe in
// components/GlobeView.tsx. Cropped to Europe and downsized for a fast
// mobile load — nothing here is fetched at runtime.
import sharp from "sharp";
import { EUROPE_MAP_BOUNDS } from "../lib/europe-geo";

const SOURCE = "node_modules/three-globe/example/img/earth-blue-marble.jpg";
const OUTPUT = "public/images/europe-satellite.jpg";
const SOURCE_WIDTH = 4096;
const SOURCE_HEIGHT = 2048;
const UPSCALE = 1.4; // a bit more detail than the raw crop, still tiny

async function main() {
  const { lonMin, lonMax, latMin, latMax } = EUROPE_MAP_BOUNDS;
  const left = Math.round(((lonMin + 180) / 360) * SOURCE_WIDTH);
  const right = Math.round(((lonMax + 180) / 360) * SOURCE_WIDTH);
  const top = Math.round(((90 - latMax) / 180) * SOURCE_HEIGHT);
  const bottom = Math.round(((90 - latMin) / 180) * SOURCE_HEIGHT);
  const width = right - left;
  const height = bottom - top;

  const info = await sharp(SOURCE)
    .extract({ left, top, width, height })
    .resize(Math.round(width * UPSCALE))
    .jpeg({ quality: 82 })
    .toFile(OUTPUT);

  console.log(`Wrote ${OUTPUT}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)}KB`);
}

main();
