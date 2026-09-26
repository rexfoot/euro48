import type { MetadataRoute } from "next";
import { SITE_URL, COUNTRY_CODES, citiesForCountry, SPECIALTY_IDS, MAX_VISIBLE_OFFERS } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
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

    for (const city of citiesForCountry(country)) {
      const cityPath = `${countryPath}/${encodeURIComponent(city)}`;
      entries.push({
        url: `${SITE_URL}${cityPath}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.6,
        alternates: sitemapAlternates(cityPath),
      });

      for (const specialty of SPECIALTY_IDS) {
        const specialtyPath = `${cityPath}/${specialty}`;
        entries.push({
          url: `${SITE_URL}${specialtyPath}`,
          lastModified: now,
          changeFrequency: "hourly",
          priority: 0.5,
          alternates: sitemapAlternates(specialtyPath),
        });
      }
    }
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
