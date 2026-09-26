import { resolveCity, matchSpecialty } from "../classify";
import { getCityIndex } from "../city-index";
import type { NewOffer } from "../offers";

// Norway's public employment service (NAV / arbeidsplassen.no). Official
// government feed, free — a fresh public token is fetched per call (no
// personal signup; NAV publishes this token specifically for this kind of
// use, see pam-stilling-feed.nav.no).
const TOKEN_URL = "https://pam-stilling-feed.nav.no/api/publicToken";
const FEED_URL = "https://pam-stilling-feed.nav.no/api/v1/feed";
const PORTAL_URL = "https://arbeidsplassen.nav.no/stillinger/stilling/";
const FETCH_TIMEOUT_MS = 15_000;

type NavFeedEntry = {
  status: string;
  title: string;
  businessName?: string;
  municipal?: string;
  sistEndret?: string;
};

type NavFeedItem = {
  id: string;
  _feed_entry: NavFeedEntry;
};

type NavFeedResponse = {
  items?: NavFeedItem[];
};

async function fetchPublicToken(): Promise<string | null> {
  try {
    const res = await fetch(TOKEN_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    const text = await res.text();
    const token = text.trim().split("\n").pop()?.trim();
    return token || null;
  } catch {
    return null;
  }
}

// This is a raw sync feed (walk-the-whole-history-via-next_url), not a
// searchable API — If-Modified-Since is the only way to jump near "now"
// instead of 2023. We re-anchor to "last 48h" every run rather than
// following next_url, since that would drift away from recent postings
// over time; fingerprint-based upsert already makes repeat fetches safe.
export async function fetchNavOffers(): Promise<NewOffer[]> {
  const token = await fetchPublicToken();
  if (!token) return [];

  const since = new Date(Date.now() - 48 * 3_600_000).toUTCString();

  let data: NavFeedResponse;
  try {
    const res = await fetch(FEED_URL, {
      headers: { Authorization: `Bearer ${token}`, "If-Modified-Since": since },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    data = (await res.json()) as NavFeedResponse;
  } catch {
    return [];
  }

  const items = data.items ?? [];
  const cityIndex = await getCityIndex();

  return items
    .map((item): NewOffer | null => {
      const entry = item._feed_entry;
      if (!entry || entry.status !== "ACTIVE") return null;

      const specialty = matchSpecialty(entry.title);

      const { city, lat, lng } = resolveCity(cityIndex, entry.municipal ? [entry.municipal] : [], "NO");

      return {
        id: `nav:${item.id}`,
        titleOriginal: entry.title,
        titleEn: entry.title,
        titleFr: entry.title,
        titleEs: entry.title,
        company: entry.businessName || "—",
        countryCode: "NO",
        city,
        cityLat: lat,
        cityLng: lng,
        specialty,
        contractType: null,
        salaryRaw: null,
        remote: /hjemmekontor|remote/i.test(entry.title),
        languageOfAd: "no",
        url: `${PORTAL_URL}${encodeURIComponent(item.id)}`,
        source: "nav",
        publishedAt: entry.sistEndret ? new Date(entry.sistEndret) : new Date(),
      };
    })
    .filter((offer): offer is NewOffer => offer !== null);
}
