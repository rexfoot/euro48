// Simple equirectangular projector for the Europe bounding box, used by the
// 2D fallback map (no external tile provider needed — keeps this free).

const LAT_MIN = 34;
const LAT_MAX = 71;
const LNG_MIN = -25;
const LNG_MAX = 32;

export function project(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * width;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * height;
  return { x, y };
}
