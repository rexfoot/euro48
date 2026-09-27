import type { CountryCode } from "./constants";

// One well-known local classifieds/real-estate portal per country — just
// a link out, never our own price search (spec 2026-09-27). No API, no
// scraping: these sites don't offer free listing APIs, and that's not
// what was asked for here anyway.
export const HOUSING_PORTALS: Record<CountryCode, { name: string; url: string }> = {
  FR: { name: "Le Bon Coin", url: "https://www.leboncoin.fr/recherche?category=10" },
  DE: { name: "ImmobilienScout24", url: "https://www.immobilienscout24.de/" },
  ES: { name: "Idealista", url: "https://www.idealista.com/" },
  IT: { name: "Immobiliare.it", url: "https://www.immobiliare.it/" },
  NL: { name: "Funda", url: "https://www.funda.nl/" },
  BE: { name: "Immoweb", url: "https://www.immoweb.be/" },
  CH: { name: "Homegate", url: "https://www.homegate.ch/" },
  AT: { name: "willhaben", url: "https://www.willhaben.at/iad/immobilien" },
  LU: { name: "athome.lu", url: "https://www.athome.lu/" },
  IE: { name: "Daft.ie", url: "https://www.daft.ie/" },
  NO: { name: "FINN.no", url: "https://www.finn.no/realestate/homes/search.html" },
  DK: { name: "Boligsiden", url: "https://www.boligsiden.dk/" },
  SE: { name: "Hemnet", url: "https://www.hemnet.se/" },
  FI: { name: "Etuovi", url: "https://www.etuovi.com/" },
  IS: { name: "Fasteignir.is", url: "https://fasteignir.is/" },
  PT: { name: "Imovirtual", url: "https://www.imovirtual.com/" },
  PL: { name: "Otodom", url: "https://www.otodom.pl/" },
  GB: { name: "Rightmove", url: "https://www.rightmove.co.uk/" },
};
