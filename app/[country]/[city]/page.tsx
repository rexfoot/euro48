import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUNTRY_CODES, type CountryCode } from "@/lib/constants";
import { getVisibleOffers, getActiveCitiesWithCoords } from "@/lib/offers";
import { countsBySpecialty } from "@/lib/aggregate";
import { SpecialtyGrid } from "@/components/SpecialtyGrid";
import { NearestCities, type NearbyCity } from "@/components/NearestCities";
import { BackLink, SectionLabel, CityDisplayName } from "@/components/Localized";
import { pageAlternates, countryNameFr } from "@/lib/seo";
import { cityLabel } from "@/lib/offer-display";
import { getCityCoords, distanceKm } from "@/lib/city-index";

export const revalidate = 60;

type Props = { params: Promise<{ country: string; city: string }> };

// Cities are open now: any city name is a valid page, as long as the
// country is one of our 15. An unknown/quiet city just shows an empty
// state (below), same as it always has for a temporarily-quiet city.
function resolveCityParams(countryParam: string, cityParam: string) {
  const code = countryParam.toUpperCase() as CountryCode;
  const city = decodeURIComponent(cityParam);
  if (!COUNTRY_CODES.includes(code)) return null;
  return { code, city };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryParam, city: cityParam } = await params;
  const resolved = resolveCityParams(countryParam, cityParam);
  if (!resolved) return {};

  const { code, city } = resolved;
  const country = countryNameFr(code);
  const cityName = cityLabel(city, "fr");
  return {
    title: `Offres d'emploi à ${cityName}, ${country} (48h)`,
    description: `Les offres d'emploi publiées ces dernières 48h à ${cityName} (${country}), classées par spécialité. Sans doublons.`,
    alternates: pageAlternates(`/${code.toLowerCase()}/${encodeURIComponent(city)}`),
  };
}

async function findNearbyCities(code: CountryCode, city: string): Promise<NearbyCity[]> {
  const target = await getCityCoords(city, code);
  if (!target) return [];

  const candidates = await getActiveCitiesWithCoords(code);
  return candidates
    .filter((c) => c.city !== city)
    .map((c) => ({ city: c.city, count: c.count, distanceKm: distanceKm(target, c) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3);
}

export default async function CityPage({ params }: Props) {
  const { country: countryParam, city: cityParam } = await params;
  const resolved = resolveCityParams(countryParam, cityParam);
  if (!resolved) notFound();
  const { code, city } = resolved;

  const offers = await getVisibleOffers({ country: code, city, limit: 500 });
  const specialtyCounts = countsBySpecialty(offers);
  const nearby = offers.length === 0 ? await findNearbyCities(code, city) : [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <BackLink href={`/${code.toLowerCase()}`} />
      <h1 className="mt-2 mb-1 text-2xl font-semibold"><CityDisplayName city={city} /></h1>
      <p className="mb-6 text-sm text-accent-amber">+{offers.length}</p>
      {offers.length === 0 ? (
        <NearestCities country={code} cities={nearby} />
      ) : (
        <>
          <SectionLabel labelKey="choose_specialty" />
          <div className="mt-3">
            <SpecialtyGrid country={code} city={city} counts={specialtyCounts} />
          </div>
        </>
      )}
    </main>
  );
}
