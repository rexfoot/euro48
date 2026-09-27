import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { COUNTRY_CODES, type CountryCode } from "@/lib/constants";
import { getVisibleOffers } from "@/lib/offers";
import { countsByCity } from "@/lib/aggregate";
import { CityGrid } from "@/components/CityGrid";
import { EmptyState } from "@/components/EmptyState";
import { BackLink, CountryName, SectionLabel, HousingLink } from "@/components/Localized";
import { pageAlternates, countryNameFr } from "@/lib/seo";

export const revalidate = 60;

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countryParam } = await params;
  const code = countryParam.toUpperCase() as CountryCode;
  if (!COUNTRY_CODES.includes(code)) return {};

  const name = countryNameFr(code);
  return {
    title: `Offres d'emploi en ${name} (48h)`,
    description: `Toutes les offres d'emploi publiées ces dernières 48h en ${name}, classées par ville et spécialité. Sans doublons.`,
    alternates: pageAlternates(`/${countryParam.toLowerCase()}`),
  };
}

export default async function CountryPage({ params }: Props) {
  const { country: countryParam } = await params;
  const code = countryParam.toUpperCase() as CountryCode;
  if (!COUNTRY_CODES.includes(code)) notFound();

  const offers = await getVisibleOffers({ country: code, limit: 500 });
  const cityCounts = countsByCity(offers);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <BackLink href="/" />
      <h1 className="mt-2 mb-1 text-2xl font-semibold">
        <CountryName code={code} />
      </h1>
      <p className="mb-4 text-sm text-accent-amber">+{offers.length}</p>
      <div className="mb-6">
        <HousingLink code={code} />
      </div>
      {offers.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <SectionLabel labelKey="choose_city" />
          <div className="mt-3">
            <CityGrid country={code} counts={cityCounts} />
          </div>
        </>
      )}
    </main>
  );
}
