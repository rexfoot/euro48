import { notFound } from "next/navigation";
import { COUNTRY_CODES, CITIES, SPECIALTY_IDS, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { OfferCard } from "@/components/OfferCard";
import { EmptyState } from "@/components/EmptyState";
import { BackLink, SpecialtyName } from "@/components/Localized";

export const revalidate = 60;

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ country: string; city: string; specialty: string }>;
}) {
  const { country: countryParam, city: cityParam, specialty: specialtyParam } = await params;
  const code = countryParam.toUpperCase() as CountryCode;
  const city = decodeURIComponent(cityParam);
  const specialty = specialtyParam as SpecialtyId;

  if (!COUNTRY_CODES.includes(code)) notFound();
  if (!(city in CITIES) || CITIES[city as keyof typeof CITIES].country !== code) notFound();
  if (!SPECIALTY_IDS.includes(specialty)) notFound();

  const offers = await getVisibleOffers({ country: code, city, specialty, limit: 500 });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <BackLink href={`/${code.toLowerCase()}/${encodeURIComponent(city)}`} />
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        <SpecialtyName id={specialty} /> · {city}
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
