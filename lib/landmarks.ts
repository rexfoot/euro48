import type { CountryCode } from "./constants";

// One famous, precisely-located landmark per country, for the homepage
// globe (2026-09-27). Coordinates are the actual monument, not the country
// or city centroid.
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

// Original, minimalist single-stroke pictograms — same style throughout
// (thin outline, no fill, 24x24 viewBox) — not a copy of any photo or
// existing icon set. Raw SVG markup so it can be used both as a DOM
// string (react-globe.gl's htmlElement wants a real DOM node, not JSX)
// and via dangerouslySetInnerHTML in the 2D fallback.
export const LANDMARK_ICON_SVG: Record<CountryCode, string> = {
  FR: `<path d="M12 2 9 20M12 2l3 18M10 8h4M9.3 13h5.4M7 20h10" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/>`,
  DE: `<path d="M4 20V9M8 20V9M12 20V9M16 20V9M20 20V9M3 9h18M3 6h18M9 6l3-3 3 3" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`,
  ES: `<path d="M6 20V6M6 6l-1 0M6 6l1 0M12 20V3M12 3h-2M12 3h2M18 20V6M18 6h-1M18 6h1" stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round"/>`,
  IT: `<ellipse cx="12" cy="13" rx="9" ry="6" stroke="currentColor" fill="none" stroke-width="1.2"/><path d="M4 13V9M7 13V8M10 13V7.3M14 13V7.3M17 13V8M20 13V9" stroke="currentColor" stroke-width="1"/>`,
  NL: `<path d="M12 21V9M12 9l6-4M12 9l4 6M12 9L6 5M12 9l-4 6" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/>`,
  BE: `<circle cx="12" cy="6" r="2" stroke="currentColor" fill="none" stroke-width="1"/><circle cx="6" cy="14" r="2" stroke="currentColor" fill="none" stroke-width="1"/><circle cx="18" cy="14" r="2" stroke="currentColor" fill="none" stroke-width="1"/><circle cx="12" cy="20" r="2" stroke="currentColor" fill="none" stroke-width="1"/><path d="M12 8l-6 4M12 8l6 4M6 16l6 2M18 16l-6 2M12 8v10" stroke="currentColor" stroke-width="1"/>`,
  CH: `<path d="M3 20 11 5l2 4 2-3 6 14z" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linejoin="round"/>`,
  AT: `<circle cx="12" cy="12" r="8" stroke="currentColor" fill="none" stroke-width="1.2"/><path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M6.3 17.7L17.7 6.3" stroke="currentColor" stroke-width="0.7"/><path d="M12 20v2" stroke="currentColor" stroke-width="1.2"/>`,
  LU: `<path d="M2 18Q12 4 22 18" stroke="currentColor" fill="none" stroke-width="1.2"/><path d="M2 18h20" stroke="currentColor" stroke-width="1.2"/><path d="M6 18v-3M12 18v-7M18 18v-3" stroke="currentColor" stroke-width="0.9"/>`,
  IE: `<path d="M3 20Q6 14 12 14q6 0 9 6" stroke="currentColor" fill="none" stroke-width="1.2"/><path d="M7 14V8a2 2 0 0 1 4 0v6" stroke="currentColor" fill="none" stroke-width="1.1"/><path d="M13 14V9h4v5" stroke="currentColor" fill="none" stroke-width="1.1"/>`,
  NO: `<path d="M12 21v-5M8 16h8M9 16l3-5 3 5M7 12h10M8 12l4-5 4 5M9.5 8h5M10 8l2-4 2 4" stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>`,
  DK: `<path d="M4 20Q8 17 14 19q4 1 6-1" stroke="currentColor" fill="none" stroke-width="1.2" stroke-linecap="round"/><circle cx="11" cy="10" r="2" stroke="currentColor" fill="none" stroke-width="1"/><path d="M11 12v4Q9 17 8 19M11 16Q13 17.5 15 17" stroke="currentColor" fill="none" stroke-width="1"/>`,
  SE: `<path d="M7 21V9h10v12M9 9V5h6v4" stroke="currentColor" fill="none" stroke-width="1.1"/><path d="M10 5l1-3 1 2 1-2 1 3" stroke="currentColor" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`,
  FI: `<path d="M6 20h12M8 20v-6a4 4 0 0 1 8 0v6M12 10V6M10 6h4" stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round"/>`,
  IS: `<path d="M12 21V6M9 21v-10M15 21v-10M6 21v-6M18 21v-6M4 21h16" stroke="currentColor" fill="none" stroke-width="1.1" stroke-linecap="round"/>`,
};
