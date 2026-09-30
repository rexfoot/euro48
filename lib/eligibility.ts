export type EligibilityStatus = "A" | "B" | "C";

export interface ClassificationResult {
  status: EligibilityStatus;
  professionId: string | null;
  excludeReasons: string[];
  positiveSignals: string[];
}

const VERY_HIGH_PRIORITY_PATTERNS = [
  /contratación\s+de\s+trabajadores\s+extranjeros/i,
  /contratación\s+desde\s+el\s+extranjero/i,
  /trabajadores\s+no\s+comunitarios/i,
  /non[-\s]*eu\s+workers?/i,
  /third[-\s]*country\s+nationals?/i,
  /employer[-\s]*sponsored\s+workers?/i,
  /overseas\s+recruitment/i,
  /recruitment\s+from\s+outside\s+(?:the\s+)?eu/i,
  /foreign\s+workers?\s+welcome/i,
  /workers?\s+from\s+abroad/i,
  /international\s+recruitment/i,
  /visa\s+sponsorship/i,
  /work\s*permit\s+sponsorship/i,
  /employer\s+sponsorship/i,
  /immigration\s+sponsorship/i,
  /employer[-\s]*assisted\s+visa/i,
  /we\s+sponsor/i,
  /sponsor/i,
  /relocation/i,
  /package\s*d'installation/i,
  /aide\s*à\s*l'installation/i,
  /recrutement\s*international/i,
  /international\s*hire/i,
  /work\s*permit\s*provided/i,
  /assistance\s*titre\s*de\s*séjour/i,
  /we\s*assist\s*with\s*permit/i,
  /non[-\s]*eu\s*candidates?\s*welcome/i,
  /extra[-\s]*européens?\s*acceptés/i,
  /sponsorización/i,
  /reubicación/i,
  /contratación\s*internacional/i,
  /permiso\s*de\s*trabajo\s*proporcionado/i,
  /patrocinio/i,
  /visa\s*support/i,
  /work\s*visa/i,
  /international\s*candidates?\s+welcome/i,
  /no\s*eu\s*passport\s*required/i,
  /without\s*eu\s*passport/i,
  /candidats?\s*internationaux/i,
  /candidatos?\s*internacionales/i,
  /mobilité\s*internationale/i,
  /movilidad\s*internacional/i,
];

const EU_ONLY_VETO_PATTERNS = [
  /eu\s*\/\s*eea\s*only/i,
  /eu\s*citizens?\s*only/i,
  /nationalité\s*ue/i,
  /ue\s*\/\s*eee\s*obligatoire/i,
  /eu\s*passport\s*only/i,
  /citizens?\s*of\s*the\s*eu\s*only/i,
  /must\s+be\s+(?:a\s+)?(?:eu|eea)\s+citizen/i,
  /only\s+eu\s+citizens?/i,
];

interface ProfessionDef {
  id: string;
  keywords: RegExp[];
}

const PROFESSIONS: ProfessionDef[] = [
  { id: "carnicero", keywords: [/carnicero/i, /boucher/i, /butcher/i, /metzger/i, /slagter/i] },
  { id: "panadero", keywords: [/panadero/i, /boulanger/i, /baker/i, /bäcker/i, /bagare/i] },
  { id: "peluquero", keywords: [/peluquero/i, /coiffeur/i, /hairdresser/i, /friseur/i, /frisør/i] },
  { id: "cocina", keywords: [/cocina/i, /cuisine/i, /cook/i, /chef/i, /koch/i, /kokk/i] },
  { id: "construccion", keywords: [/construcción/i, /btp/i, /construction/i, /bau/i, /bygg/i] },
  { id: "conductor", keywords: [/conductor/i, /chauffeur/i, /driver/i, /fahrer/i, /førare/i] },
  { id: "mecanica", keywords: [/mecánica/i, /mécanique/i, /mechanic/i, /mechanik/i, /mekaniker/i] },
  { id: "limpieza", keywords: [/limpieza/i, /nettoyage/i, /cleaning/i, /reinigung/i, /rengøring/i] },
  { id: "agricultura", keywords: [/agricultura/i, /agricole/i, /agriculture/i, /landwirtschaft/i, /jordbruk/i] },
  { id: "hosteleria", keywords: [/hostelería/i, /hôtellerie/i, /hospitality/i, /gastgewerbe/i, /gjestehus/i] },
  { id: "logistica", keywords: [/logística/i, /entrepôt/i, /logistics/i, /lager/i, /logistikk/i] },
  { id: "cuidado", keywords: [/cuidado/i, /aide\s*à\s*la\s*personne/i, /care/i, /pflege/i, /omsorg/i] },
];

export function classifyOffer(title: string, description: string): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();
  const excludeReasons: string[] = [];
  const positiveSignals: string[] = [];

  for (const pattern of VERY_HIGH_PRIORITY_PATTERNS) {
    if (pattern.test(text)) {
      positiveSignals.push(pattern.source);
    }
  }

  for (const pattern of EU_ONLY_VETO_PATTERNS) {
    if (pattern.test(text)) {
      excludeReasons.push(pattern.source);
    }
  }

  if (excludeReasons.length > 0 && positiveSignals.length === 0) {
    return { status: "C", professionId: null, excludeReasons, positiveSignals };
  }

  let professionId: string | null = null;
  for (const prof of PROFESSIONS) {
    if (prof.keywords.some(kw => kw.test(text))) {
      professionId = prof.id;
      break;
    }
  }

  if (!professionId) {
    return { status: "C", professionId: null, excludeReasons, positiveSignals };
  }

  if (positiveSignals.length > 0) {
    return { status: "A", professionId, excludeReasons, positiveSignals };
  }

  return { status: "C", professionId: null, excludeReasons, positiveSignals };
}
