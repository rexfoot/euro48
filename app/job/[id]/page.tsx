import { notFound } from "next/navigation";
import { getOfferById } from "@/lib/offers";
import { OfferCard } from "@/components/OfferCard";
import { BackLink } from "@/components/Localized";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOfferById(id);
  if (!offer) notFound();

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
      <BackLink href={`/${offer.country_code.toLowerCase()}/${encodeURIComponent(offer.city)}/${offer.specialty}`} />
      <div className="mt-4">
        <OfferCard offer={offer} />
      </div>
    </main>
  );
}
