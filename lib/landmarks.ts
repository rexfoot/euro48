import type { CountryCode } from "./constants";

// One famous, precisely-located landmark per country, for the homepage
// globe (2026-09-27) — the pin sits on the actual monument, not the
// country/city centroid, even though the pin itself is a flag now (spec
// 2026-09-27: banderas, not monument icons).
export type Landmark = { country: CountryCode; lat: number; lng: number };

// FR/DE/NL/BE/LU/CH are real neighbours squeezed into a small area of the
// map — at a 44px flag-pin size (spec 2026-09-27: "grandes y claras") their
// real landmark coordinates overlap each other badly. Those 6 are nudged to
// still-true-to-the-country but mutually spread-out points (verified via
// scripts/check-landmark-overlap.ts) instead of the single most iconic
// monument; every other country keeps its real landmark.
export const LANDMARKS: Landmark[] = [
  { country: "FR", lat: 47.5, lng: -0.6 }, // Loire Valley — moved from the Eiffel Tower, too close to BE/LU/DE at this pin size
  { country: "DE", lat: 50.1, lng: 10.3 }, // Thuringian Forest — moved from Berlin, too close to Denmark at this pin size
  { country: "ES", lat: 41.4036, lng: 2.1744 }, // Sagrada Família
  { country: "IT", lat: 41.8902, lng: 12.4922 }, // Colosseum
  { country: "NL", lat: 53.2, lng: 6.0 }, // Groningen area — moved from Zaanse Schans, too close to Belgium at this pin size
  { country: "BE", lat: 50.8949, lng: 4.3416 }, // Atomium
  { country: "CH", lat: 45.9763, lng: 7.6586 }, // Matterhorn
  { country: "AT", lat: 48.2165, lng: 16.3969 }, // Wiener Riesenrad (Prater)
  { country: "LU", lat: 49.5, lng: 6.5 }, // south-east Luxembourg — moved from the Adolphe Bridge, too close to FR/BE/NL/CH at this pin size
  { country: "IE", lat: 52.5211, lng: -7.8907 }, // Rock of Cashel
  { country: "NO", lat: 61.0453, lng: 7.8107 }, // Borgund stave church
  { country: "DK", lat: 55.6929, lng: 12.5993 }, // The Little Mermaid
  { country: "SE", lat: 59.3273, lng: 18.054 }, // Stockholm City Hall
  { country: "FI", lat: 60.1699, lng: 24.9522 }, // Helsinki Cathedral
  { country: "IS", lat: 64.1427, lng: -21.9265 }, // Hallgrímskirkja
];
