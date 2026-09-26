import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOfferById } from "@/lib/offers";
import { OfferCard } from "@/components/OfferCard";
import { BackLink } from "@/components/Localized";
import { titleFor, cityLabel } from "@/lib/offer-display";
import { pageAlternates, countryNameFr, jobPostingJsonLd } from "@/lib/seo";
import type { CountryCode } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const offer = await getOfferById(decodeURIComponent(id));
  if (!offer) return {};

  const title = titleFor(offer, "fr");
  const country = countryNameFr(offer.country_code as CountryCode);
  const city = cityLabel(offer.city, "fr");
  return {
    title: `${title} — ${city}, ${country}`,
    description: `${title} chez ${offer.company} à ${city}, ${country}. Offre publiée il y a moins de 48h sur Euro48.`,
    alternates: pageAlternates(`/job/${encodeURIComponent(offer.id)}`),
  };
}

export default async function JobPage({ params }: Props) {
  const { id } = await params;
  const offer = await getOfferById(decodeURIComponent(id));
  if (!offer) notFound();

  const jsonLd = jobPostingJsonLd(offer);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BackLink href={`/${offer.country_code.toLowerCase()}/${encodeURIComponent(offer.city)}/${offer.specialty}`} />
      <div className="mt-4">
        <OfferCard offer={offer} />
      </div>
    </main>
  );
}
