// Duplicate detection per spec section 3:
// fingerprint = normalize(company) + normalize(title) + city + country
// normalize: lowercase, strip accents, strip legal-entity suffixes.
//
// The fingerprint is what's UNIQUE-constrained in the DB (schema.sql), so
// it's what actually prevents the same real posting from being stored
// twice across sources. Title normalization additionally strips the
// gender/format noise ("(m/w/d)", "H/F", "all genders"...) that sources
// append inconsistently, and any occurrence of the offer's own city name
// inside the title (some sources append it, e.g. Adzuna's "- (Madrid)") —
// both would otherwise make the same real job fingerprint differently
// depending on which source posted it.

const LEGAL_SUFFIXES = [
  "sa", "sl", "sarl", "gmbh", "ltd", "bv", "ag", "srl", "sas", "sasu",
  "nv", "kg", "plc", "spa", "oy", "ab", "as",
];

// Compact gender/format markers seen across sources: "(m/w/d)", "w/m/d",
// "(h/f)", "f/h", "(m/f/d)"... Restricted to this letter set (not any
// a-z) so it can never eat a real short word.
const GENDER_MARKER = /\(?\s*[mwfhdx]\s*\/\s*[mwfhdx](?:\s*\/\s*[mwfhdx])?\s*\)?/gi;

const GENDER_PHRASES = [
  /\ball genders?\b/gi,
  /\balle geschlechter\b/gi,
  /\btous genres\b/gi,
  /\btodos los g[ée]neros\b/gi,
];

function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function stripGenderNoise(input: string): string {
  let s = input;
  for (const pattern of GENDER_PHRASES) s = s.replace(pattern, " ");
  s = s.replace(GENDER_MARKER, " ");
  return s;
}

function normalize(input: string): string {
  let s = stripAccents(input.toLowerCase().trim());
  s = s.replace(/[^a-z0-9\s]/g, " ");
  const words = s
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !LEGAL_SUFFIXES.includes(w))
    .filter((w) => w.length > 1); // drop stray single-letter leftovers (gender markers not caught above)
  return words.join(" ");
}

function stripPhrase(haystack: string, phrase: string): string {
  if (!phrase) return haystack;
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return haystack.replace(new RegExp(`\\b${escaped}\\b`, "g"), " ").replace(/\s+/g, " ").trim();
}

export function buildFingerprint(params: {
  company: string;
  title: string;
  city: string;
  countryCode: string;
}): string {
  const company = normalize(params.company);
  const city = normalize(params.city);
  const country = params.countryCode.toLowerCase().trim();

  let title = normalize(stripGenderNoise(params.title));
  title = stripPhrase(title, city);

  return `${company}|${title}|${city}|${country}`;
}

export { normalize as normalizeForFingerprint };
