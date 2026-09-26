import type { Metadata } from "next";
import { COUNTRIES } from "@/lib/constants";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "À propos",
  description: "Comment fonctionne Euro48 : la règle des 48h, la déduplication des offres, et les 15 pays couverts.",
  alternates: pageAlternates("/about"),
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">
        Euro<span className="text-accent-amber">48</span>
      </h1>
      <p className="mb-2 text-muted">
        Les offres d&apos;Europe des 48 dernières heures. Sans doublons.
      </p>
      <p className="mb-2 text-muted">
        Ofertas de Europa de las últimas 48 horas. Sin repeticiones.
      </p>
      <p className="mb-8 text-muted">
        Europe&apos;s jobs from the last 48 hours. No duplicates.
      </p>

      <h2 className="mb-2 text-lg font-medium">La règle des 48h</h2>
      <ul className="mb-8 list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Publiée il y a moins de 48h → visible</li>
        <li>48h ou plus → retirée de l&apos;affichage</li>
        <li>72h ou plus → supprimée définitivement</li>
        <li>Aucun doublon : une seule offre par entreprise + poste + ville</li>
      </ul>

      <h2 className="mb-2 text-lg font-medium">Pays couverts</h2>
      <div className="flex flex-wrap gap-2 text-sm text-muted">
        {COUNTRIES.map((c) => (
          <span key={c.code} className="rounded-full border border-border px-2.5 py-1">
            {c.name.fr}
          </span>
        ))}
      </div>
    </main>
  );
}
