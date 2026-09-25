import { notFound } from "next/navigation";
import { COUNTRY_CODES, citiesForCountry, type CountryCode } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { countsByCity } from "@/lib/aggregate";
import { CityGrid } from "@/components/CityGrid";
import { BackLink, CountryName, SectionLabel } from "@/components/Localized";

export const revalidate = 60;

export default async function CountryPage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countryParam } = await params;
  const code = countryParam.toUpperCase() as CountryCode;
  if (!COUNTRY_CODES.includes(code)) notFound();

  const offers = await getVisibleOffers({ country: code, limit: 500 });
  const cityCounts = countsByCity(offers);
  const cities = citiesForCountry(code);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <BackLink href="/" />
      <h1 className="mt-2 mb-1 text-2xl font-semibold">
        <CountryName code={code} />
      </h1>
      <p className="mb-6 text-sm text-accent-amber">+{offers.length}</p>
      <SectionLabel labelKey="choose_city" />
      <div className="mt-3">
        <CityGrid country={code} cities={cities} counts={cityCounts} />
      </div>
    </main>
  );
}
