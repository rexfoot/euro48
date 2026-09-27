import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUNTRY_CODES, SPECIALTY_IDS, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState } from "@/components/EmptyState";
import { BackLink, SpecialtyName, CityDisplayName } from "@/components/Localized";
import { pageAlternates, countryNameFr, specialtyNameFr } from "@/lib/seo";
import { cityLabel } from "@/lib/offer-display";

export const revalidate = 60;

type Props = { params: Promise<{ country: string; city: string; specialty: string }> };

// Cities are open now — only country and specialty stay closed lists.
function resolveParams(countryParam: string, cityParam: string, specialtyParam: string) {
  const code = countryParam.toUpperCase() as CountryCode;
  const city = decodeURIComponent(cityParam);
  const specialty = specialtyParam as SpecialtyId;

  if (!COUNTRY_CODES.includes(code)) return null;
  if (!SPECIALTY_IDS.includes(specialty)) return null;
  return { code, city, specialty };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryParam, city: cityParam, specialty: specialtyParam } = await params;
  const resolved = resolveParams(countryParam, cityParam, specialtyParam);
  if (!resolved) return {};

  const { code, city, specialty } = resolved;
  const country = countryNameFr(code);
  const cityName = cityLabel(city, "fr", code);
  const specialtyName = specialtyNameFr(specialty);
  return {
    title: `${specialtyName} à ${cityName}, ${country} (48h)`,
    description: `Offres d'emploi en ${specialtyName.toLowerCase()} publiées ces dernières 48h à ${cityName} (${country}). Sans doublons.`,
    alternates: pageAlternates(`/${code.toLowerCase()}/${encodeURIComponent(city)}/${specialty}`),
  };
}

export default async function SpecialtyPage({ params }: Props) {
  const { country: countryParam, city: cityParam, specialty: specialtyParam } = await params;
  const resolved = resolveParams(countryParam, cityParam, specialtyParam);
  if (!resolved) notFound();
  const { code, city, specialty } = resolved;

  const offers = await getVisibleOffers({ country: code, city, specialty, limit: 500 });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <BackLink href={`/${code.toLowerCase()}/${encodeURIComponent(city)}`} />
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        <SpecialtyName id={specialty} /> · <CityDisplayName city={city} country={code} />
      </h1>
      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </main>
  );
}
