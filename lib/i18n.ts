import { type Locale } from "./constants";

export const TAGLINE: Record<Locale, string> = {
  fr: "Les offres d'Europe des 48 dernières heures. Sans doublons.",
  es: "Ofertas de Europa de las últimas 48 horas. Sin repeticiones.",
  en: "Europe's jobs from the last 48 hours. No duplicates.",
};

export const UI: Record<Locale, Record<string, string>> = {
  fr: {
    counter_prefix: "+",
    counter_suffix: "offres en 48h",
    new_badge: "NEW",
    today_badge: "AUJOURD'HUI",
    urgent_badge: "URGENT",
    minutes_ago: "il y a {n}m",
    hours_ago: "il y a {n}h",
    see_offer: "Voir l'offre",
    no_offers: "Aucune offre en ce moment sur ce filtre.",
    no_offers_sub: "On ne remplit pas avec du vieux — reviens bientôt.",
    choose_city: "Choisir une ville",
    choose_specialty: "Choisir une spécialité",
    back: "Retour",
    all_countries: "Tous les pays",
    high_salary: "Haut salaire",
    climate: "Climat",
    high_demand: "Demande",
    about_link: "À propos",
    privacy_link: "Confidentialité",
    terms_link: "Conditions",
    other_locations: "Autres localisations",
    all_cities: "Toutes les villes",
    search_city: "Chercher une ville…",
  },
  es: {
    counter_prefix: "+",
    counter_suffix: "ofertas en 48h",
    new_badge: "NUEVO",
    today_badge: "HOY",
    urgent_badge: "URGENTE",
    minutes_ago: "hace {n}m",
    hours_ago: "hace {n}h",
    see_offer: "Ver la oferta",
    no_offers: "No hay ofertas ahora mismo con este filtro.",
    no_offers_sub: "No rellenamos con ofertas viejas — vuelve pronto.",
    choose_city: "Elegir ciudad",
    choose_specialty: "Elegir especialidad",
    back: "Volver",
    all_countries: "Todos los países",
    high_salary: "Salario alto",
    climate: "Clima",
    high_demand: "Demanda",
    about_link: "Acerca de",
    privacy_link: "Privacidad",
    terms_link: "Términos",
    other_locations: "Otras ubicaciones",
    all_cities: "Todas las ciudades",
    search_city: "Buscar una ciudad…",
  },
  en: {
    counter_prefix: "+",
    counter_suffix: "jobs in 48h",
    new_badge: "NEW",
    today_badge: "TODAY",
    urgent_badge: "URGENT",
    minutes_ago: "{n}m ago",
    hours_ago: "{n}h ago",
    see_offer: "View offer",
    no_offers: "No offers right now for this filter.",
    no_offers_sub: "We don't fill it with stale offers — check back soon.",
    choose_city: "Choose a city",
    choose_specialty: "Choose a specialty",
    back: "Back",
    all_countries: "All countries",
    high_salary: "High salary",
    climate: "Climate",
    high_demand: "In demand",
    about_link: "About",
    privacy_link: "Privacy",
    terms_link: "Terms",
    other_locations: "Other locations",
    all_cities: "All cities",
    search_city: "Search a city…",
  },
};

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let str = UI[locale][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
