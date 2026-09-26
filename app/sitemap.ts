import type { MetadataRoute } from "next";
import { SITE_URL, COUNTRY_CODES, MAX_VISIBLE_OFFERS } from "@/lib/constants";
import { getVisibleOffers, getActiveLocationBreakdown } from "@/lib/offers";
import { sitemapAlternates } from "@/lib/seo";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "always", priority: 1, alternates: sitemapAlternates("/") },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3, alternates: sitemapAlternates("/about") },
    { url: `${SITE_URL}/legal/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.1, alternates: sitemapAlternates("/legal/privacy") },
    { url: `${SITE_URL}/legal/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.1, alternates: sitemapAlternates("/legal/terms") },
  ];

  for (const country of COUNTRY_CODES) {
    const countryPath = `/${country.toLowerCase()}`;
    entries.push({
      url: `${SITE_URL}${countryPath}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
      alternates: sitemapAlternates(countryPath),
    });
  }

  // Cities are open (no fixed list) — only list the (country, city) and
  // (country, city, specialty) combinations that actually have offers
  // right now, instead of enumerating a static list that no longer exists.
  const breakdown = await getActiveLocationBreakdown();
  const seenCityPaths = new Set<string>();

  for (const row of breakdown) {
    const countryPath = `/${row.country_code.toLowerCase()}`;
    const cityPath = `${countryPath}/${encodeURIComponent(row.city)}`;

    if (!seenCityPaths.has(cityPath)) {
      seenCityPaths.add(cityPath);
      entries.push({
        url: `${SITE_URL}${cityPath}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.6,
        alternates: sitemapAlternates(cityPath),
      });
    }

    const specialtyPath = `${cityPath}/${row.specialty}`;
    entries.push({
      url: `${SITE_URL}${specialtyPath}`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.5,
      alternates: sitemapAlternates(specialtyPath),
    });
  }

  const offers = await getVisibleOffers({ limit: MAX_VISIBLE_OFFERS });
  for (const offer of offers) {
    const jobPath = `/job/${encodeURIComponent(offer.id)}`;
    entries.push({
      url: `${SITE_URL}${jobPath}`,
      lastModified: new Date(offer.published_at),
      changeFrequency: "hourly",
      priority: 0.4,
      alternates: sitemapAlternates(jobPath),
    });
  }

  return entries;
}
