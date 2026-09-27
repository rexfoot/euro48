import type { CountryCode } from "./constants";

// One famous, precisely-located landmark per country, for the homepage
// globe (2026-09-27) — the pin sits on the actual monument, not the
// country/city centroid, even though the pin itself is a flag now (spec
// 2026-09-27: banderas, not monument icons).
export type Landmark = { country: CountryCode; lat: number; lng: number };

export const LANDMARKS: Landmark[] = [
  { country: "FR", lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
  { country: "DE", lat: 52.5163, lng: 13.3777 }, // Brandenburg Gate
  { country: "ES", lat: 41.4036, lng: 2.1744 }, // Sagrada Família
  { country: "IT", lat: 41.8902, lng: 12.4922 }, // Colosseum
  { country: "NL", lat: 52.475, lng: 4.8156 }, // Zaanse Schans windmills
  { country: "BE", lat: 50.8949, lng: 4.3416 }, // Atomium
  { country: "CH", lat: 45.9763, lng: 7.6586 }, // Matterhorn
  { country: "AT", lat: 48.2165, lng: 16.3969 }, // Wiener Riesenrad (Prater)
  { country: "LU", lat: 49.6058, lng: 6.1276 }, // Adolphe Bridge
  { country: "IE", lat: 52.5211, lng: -7.8907 }, // Rock of Cashel
  { country: "NO", lat: 61.0453, lng: 7.8107 }, // Borgund stave church
  { country: "DK", lat: 55.6929, lng: 12.5993 }, // The Little Mermaid
  { country: "SE", lat: 59.3273, lng: 18.054 }, // Stockholm City Hall
  { country: "FI", lat: 60.1699, lng: 24.9522 }, // Helsinki Cathedral
  { country: "IS", lat: 64.1427, lng: -21.9265 }, // Hallgrímskirkja
];
