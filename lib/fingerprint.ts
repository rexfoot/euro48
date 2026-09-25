// Duplicate detection per spec section 3:
// fingerprint = normalize(company) + normalize(title) + city + country
// normalize: lowercase, strip accents, strip legal-entity suffixes.

const LEGAL_SUFFIXES = [
  "sa", "sl", "sarl", "gmbh", "ltd", "bv", "ag", "srl", "sas", "sasu",
  "nv", "kg", "plc", "spa", "oy", "ab", "as",
];

function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function normalize(input: string): string {
  let s = stripAccents(input.toLowerCase().trim());
  s = s.replace(/[^a-z0-9\s]/g, " ");
  const words = s.split(/\s+/).filter(Boolean).filter((w) => !LEGAL_SUFFIXES.includes(w));
  return words.join(" ");
}

export function buildFingerprint(params: {
  company: string;
  title: string;
  city: string;
  countryCode: string;
}): string {
  const company = normalize(params.company);
  const title = normalize(params.title);
  const city = normalize(params.city);
  const country = params.countryCode.toLowerCase().trim();
  return `${company}|${title}|${city}|${country}`;
}

export { normalize as normalizeForFingerprint };
