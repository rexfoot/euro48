import { notFound } from "next/navigation";
import { COUNTRY_CODES, CITIES, type CountryCode } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { countsBySpecialty } from "@/lib/aggregate";
import { SpecialtyGrid } from "@/components/SpecialtyGrid";
import { BackLink, SectionLabel } from "@/components/Localized";

export const revalidate = 60;

export default async function CityPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country: countryParam, city: cityParam } = await params;
  const code = countryParam.toUpperCase() as CountryCode;
  const city = decodeURIComponent(cityParam);

  if (!COUNTRY_CODES.includes(code)) notFound();
  if (!(city in CITIES) || CITIES[city as keyof typeof CITIES].country !== code) notFound();

  const offers = await getVisibleOffers({ country: code, city, limit: 500 });
  const specialtyCounts = countsBySpecialty(offers);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <BackLink href={`/${code.toLowerCase()}`} />
      <h1 className="mt-2 mb-1 text-2xl font-semibold">{city}</h1>
      <p className="mb-6 text-sm text-accent-amber">+{offers.length}</p>
      <SectionLabel labelKey="choose_specialty" />
      <div className="mt-3">
        <SpecialtyGrid country={code} city={city} counts={specialtyCounts} />
      </div>
    </main>
  );
}
