// Closed lists per Euro48 spec. Nothing outside these lists is ever shown
// (globe, ticker, lists, DB seed) — see spec section 12 "INTERDIT".

export const COUNTRIES = [
  { code: "DE", name: { fr: "Allemagne", es: "Alemania", en: "Germany" } },
  { code: "NL", name: { fr: "Pays-Bas", es: "Países Bajos", en: "Netherlands" } },
  { code: "CH", name: { fr: "Suisse", es: "Suiza", en: "Switzerland" } },
  { code: "LU", name: { fr: "Luxembourg", es: "Luxemburgo", en: "Luxembourg" } },
  { code: "BE", name: { fr: "Belgique", es: "Bélgica", en: "Belgium" } },
  { code: "AT", name: { fr: "Autriche", es: "Austria", en: "Austria" } },
  { code: "IE", name: { fr: "Irlande", es: "Irlanda", en: "Ireland" } },
  { code: "FR", name: { fr: "France", es: "Francia", en: "France" } },
  { code: "ES", name: { fr: "Espagne", es: "España", en: "Spain" } },
  { code: "IT", name: { fr: "Italie", es: "Italia", en: "Italy" } },
  { code: "NO", name: { fr: "Norvège", es: "Noruega", en: "Norway" } },
  { code: "DK", name: { fr: "Danemark", es: "Dinamarca", en: "Denmark" } },
  { code: "SE", name: { fr: "Suède", es: "Suecia", en: "Sweden" } },
  { code: "FI", name: { fr: "Finlande", es: "Finlandia", en: "Finland" } },
  { code: "IS", name: { fr: "Islande", es: "Islandia", en: "Iceland" } },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as CountryCode[];

// City -> { country, coordinates } for globe points and dropdowns.
export const CITIES: Record<
  string,
  { country: CountryCode; lat: number; lng: number }
> = {
  Berlin: { country: "DE", lat: 52.52, lng: 13.405 },
  Munich: { country: "DE", lat: 48.1351, lng: 11.582 },
  Hamburg: { country: "DE", lat: 53.5511, lng: 9.9937 },
  Frankfurt: { country: "DE", lat: 50.1109, lng: 8.6821 },
  Cologne: { country: "DE", lat: 50.9375, lng: 6.9603 },
  Stuttgart: { country: "DE", lat: 48.7758, lng: 9.1829 },
  Düsseldorf: { country: "DE", lat: 51.2277, lng: 6.7735 },

  Amsterdam: { country: "NL", lat: 52.3676, lng: 4.9041 },
  Rotterdam: { country: "NL", lat: 51.9244, lng: 4.4777 },
  "The Hague": { country: "NL", lat: 52.0705, lng: 4.3007 },
  Utrecht: { country: "NL", lat: 52.0907, lng: 5.1214 },
  Eindhoven: { country: "NL", lat: 51.4416, lng: 5.4697 },

  Zurich: { country: "CH", lat: 47.3769, lng: 8.5417 },
  Geneva: { country: "CH", lat: 46.2044, lng: 6.1432 },
  Basel: { country: "CH", lat: 47.5596, lng: 7.5886 },
  Bern: { country: "CH", lat: 46.948, lng: 7.4474 },
  Lausanne: { country: "CH", lat: 46.5197, lng: 6.6323 },

  Luxembourg: { country: "LU", lat: 49.6116, lng: 6.1319 },

  Brussels: { country: "BE", lat: 50.8503, lng: 4.3517 },
  Antwerp: { country: "BE", lat: 51.2194, lng: 4.4025 },
  Ghent: { country: "BE", lat: 51.0543, lng: 3.7174 },
  Liège: { country: "BE", lat: 50.6326, lng: 5.5797 },

  Vienna: { country: "AT", lat: 48.2082, lng: 16.3738 },
  Graz: { country: "AT", lat: 47.0707, lng: 15.4395 },
  Salzburg: { country: "AT", lat: 47.8095, lng: 13.055 },
  Linz: { country: "AT", lat: 48.3069, lng: 14.2858 },

  Dublin: { country: "IE", lat: 53.3498, lng: -6.2603 },
  Cork: { country: "IE", lat: 51.8985, lng: -8.4756 },
  Galway: { country: "IE", lat: 53.2707, lng: -9.0568 },
  Limerick: { country: "IE", lat: 52.6638, lng: -8.6267 },

  Paris: { country: "FR", lat: 48.8566, lng: 2.3522 },
  Lyon: { country: "FR", lat: 45.764, lng: 4.8357 },
  Marseille: { country: "FR", lat: 43.2965, lng: 5.3698 },
  Lille: { country: "FR", lat: 50.6292, lng: 3.0573 },
  Toulouse: { country: "FR", lat: 43.6047, lng: 1.4442 },
  Nice: { country: "FR", lat: 43.7102, lng: 7.262 },
  Strasbourg: { country: "FR", lat: 48.5734, lng: 7.7521 },

  Madrid: { country: "ES", lat: 40.4168, lng: -3.7038 },
  Barcelona: { country: "ES", lat: 41.3874, lng: 2.1686 },
  Valencia: { country: "ES", lat: 39.4699, lng: -0.3763 },
  Málaga: { country: "ES", lat: 36.7213, lng: -4.4214 },
  Palma: { country: "ES", lat: 39.5696, lng: 2.6502 },
  Bilbao: { country: "ES", lat: 43.263, lng: -2.935 },
  Seville: { country: "ES", lat: 37.3891, lng: -5.9845 },

  Milan: { country: "IT", lat: 45.4642, lng: 9.19 },
  Rome: { country: "IT", lat: 41.9028, lng: 12.4964 },
  Turin: { country: "IT", lat: 45.0703, lng: 7.6869 },
  Bologna: { country: "IT", lat: 44.4949, lng: 11.3426 },
  Florence: { country: "IT", lat: 43.7696, lng: 11.2558 },
  Venice: { country: "IT", lat: 45.4408, lng: 12.3155 },
  Naples: { country: "IT", lat: 40.8518, lng: 14.2681 },

  Oslo: { country: "NO", lat: 59.9139, lng: 10.7522 },
  Bergen: { country: "NO", lat: 60.3913, lng: 5.3221 },
  Trondheim: { country: "NO", lat: 63.4305, lng: 10.3951 },
  Stavanger: { country: "NO", lat: 58.97, lng: 5.7331 },

  Copenhagen: { country: "DK", lat: 55.6761, lng: 12.5683 },
  Aarhus: { country: "DK", lat: 56.1629, lng: 10.2039 },
  Odense: { country: "DK", lat: 55.4038, lng: 10.4024 },
  Aalborg: { country: "DK", lat: 57.0488, lng: 9.9217 },

  Stockholm: { country: "SE", lat: 59.3293, lng: 18.0686 },
  Gothenburg: { country: "SE", lat: 57.7089, lng: 11.9746 },
  Malmö: { country: "SE", lat: 55.605, lng: 13.0038 },
  Uppsala: { country: "SE", lat: 59.8586, lng: 17.6389 },

  Helsinki: { country: "FI", lat: 60.1699, lng: 24.9384 },
  Tampere: { country: "FI", lat: 61.4978, lng: 23.761 },
  Turku: { country: "FI", lat: 60.4518, lng: 22.2666 },

  Reykjavik: { country: "IS", lat: 64.1466, lng: -21.9426 },
};

export type CityName = keyof typeof CITIES;

export function citiesForCountry(code: CountryCode): CityName[] {
  return (Object.keys(CITIES) as CityName[]).filter(
    (city) => CITIES[city].country === code
  );
}

// Exactly 8 specialties. No other taxonomy (spec section 4 / 12).
export const SPECIALTIES = [
  {
    id: "hospitality",
    name: { fr: "Hôtellerie / tourisme", es: "Hostelería / turismo", en: "Hospitality / tourism" },
    keywords: ["hotel", "restaurant", "tourism", "hospitality", "hôtellerie", "hosteleria", "turismo", "waiter", "chef", "cocinero", "serveur", "hotell", "restaurang", "ravintola"],
  },
  {
    id: "logistics",
    name: { fr: "Logistique / entrepôt", es: "Logística / almacén", en: "Logistics / warehouse" },
    keywords: ["logistics", "warehouse", "entrepôt", "almacen", "almacén", "logistique", "fulfillment", "picker", "magazijn", "lager", "logistik", "varasto"],
  },
  {
    id: "healthcare",
    name: { fr: "Santé / soins", es: "Salud / cuidados", en: "Healthcare / care" },
    keywords: ["nurse", "health", "care", "santé", "soins", "salud", "enfermero", "infirmier", "pflege", "zorg", "caregiver", "sjuksköterska", "läkare", "sykepleier", "lege", "sygeplejerske", "læge", "sairaanhoitaja", "lääkäri", "terveys", "helse"],
  },
  {
    id: "construction",
    name: { fr: "Construction", es: "Construcción", en: "Construction" },
    keywords: ["construction", "construccion", "bau", "bouw", "builder", "electrician", "plumber", "mason", "albañil", "maçon", "bygg", "byggnad", "rakennus"],
  },
  {
    id: "retail",
    name: { fr: "Commerce / retail", es: "Comercio / retail", en: "Retail / commerce" },
    keywords: ["retail", "commerce", "comercio", "shop", "store", "vendeur", "vendedor", "cashier", "verkauf", "winkel", "butik", "butikk", "försäljning", "salg", "myyjä", "kauppa"],
  },
  {
    id: "industry",
    name: { fr: "Industrie / maintenance", es: "Industria / mantenimiento", en: "Industry / maintenance" },
    keywords: ["industry", "industria", "maintenance", "mantenimiento", "manufacturing", "technicien", "tecnico", "industrie", "produktion", "underhåll", "vedlikehold", "vedligeholdelse", "teollisuus"],
  },
  {
    id: "transport",
    name: { fr: "Transport / conducteurs", es: "Transporte / conductores", en: "Transport / drivers" },
    keywords: ["driver", "conducteur", "conductor", "transport", "chauffeur", "trucker", "delivery", "fahrer", "chofer", "förare", "sjåfør", "chauffør", "kuljettaja"],
  },
  {
    id: "it",
    name: { fr: "IT / support", es: "IT / soporte", en: "IT / support" },
    keywords: ["it support", "developer", "software", "informatique", "informatica", "helpdesk", "sysadmin", "devops", "programmer"],
  },
] as const;

export type SpecialtyId = (typeof SPECIALTIES)[number]["id"];

export const SPECIALTY_IDS = SPECIALTIES.map((s) => s.id) as SpecialtyId[];

// Country badges (spec section 6)
export const HIGH_SALARY_COUNTRIES: CountryCode[] = ["CH", "LU", "NO", "DK", "IE", "NL", "DE", "AT", "BE", "SE", "FI"];
export const CLIMATE_COUNTRIES: CountryCode[] = ["ES", "IT"];
export const HIGH_DEMAND_COUNTRIES: CountryCode[] = ["NL", "DE", "BE", "AT", "CH"];

export const URGENT_KEYWORDS = [
  "immédiat", "immediat", "asap", "ab sofort", "pourvue rapidement",
  "urgente", "immediato", "urgent", "dringend", "spoedig",
];

// Best-guess language of the original ad by country — used by sources whose
// API doesn't report the ad's language directly (Adzuna, Arbeitnow).
export const LANGUAGE_BY_COUNTRY: Partial<Record<CountryCode, string>> = {
  DE: "de", NL: "nl", CH: "de", BE: "fr", AT: "de", FR: "fr", ES: "es", IT: "it",
};

export const LOCALES = ["fr", "es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const OFFER_VISIBLE_HOURS = 48;
export const OFFER_DELETE_HOURS = 72;
export const MAX_VISIBLE_OFFERS = 2000;

export const SITE_URL = "https://euro48.com";
