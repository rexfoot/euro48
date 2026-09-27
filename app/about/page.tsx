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
      <div className="mb-10 space-y-6">
        <div className="space-y-1.5 text-sm text-muted">
          <p className="text-base font-medium text-foreground">
            Trouvez votre prochain emploi avant tout le monde.
          </p>
          <p>
            Euro48 réunit les offres d&apos;emploi les plus fraîches d&apos;Europe — uniquement des offres
            publiées dans les dernières 48 heures.
          </p>
          <p>Pas d&apos;annonces anciennes. Pas de doublons. Plus besoin de faire défiler des offres périmées.</p>
          <p>Juste des opportunités fraîches partout en Europe, mises à jour en continu.</p>
          <p>
            Recherchez par métier, pays et ville, trouvez les dernières opportunités instantanément, et
            activez les alertes Email ou Telegram pour être prévenu dès qu&apos;une nouvelle offre correspond
            à vos critères.
          </p>
          <p className="font-medium text-foreground">Offres fraîches. Dernières 48 heures. Partout en Europe.</p>
          <p className="font-medium text-accent-amber">Euro48 — Ne cherchez pas les offres d&apos;hier.</p>
        </div>

        <div className="space-y-1.5 text-sm text-muted">
          <p className="text-base font-medium text-foreground">
            Encuentra tu próximo empleo antes que nadie.
          </p>
          <p>
            Euro48 reúne las ofertas de empleo más recientes de toda Europa — solo ofertas publicadas en
            las últimas 48 horas.
          </p>
          <p>Sin anuncios antiguos. Sin ofertas duplicadas. Sin desplazarte sin fin entre ofertas caducadas.</p>
          <p>Solo oportunidades frescas de toda Europa, actualizadas continuamente.</p>
          <p>
            Busca por puesto, país y ciudad, encuentra las últimas oportunidades al instante, y activa las
            alertas por Email o Telegram para que te avisemos en cuanto aparezca una oferta que coincida.
          </p>
          <p className="font-medium text-foreground">Ofertas frescas. Últimas 48 horas. En toda Europa.</p>
          <p className="font-medium text-accent-amber">Euro48 — No busques las ofertas de ayer.</p>
        </div>

        <div className="space-y-1.5 text-sm text-muted">
          <p className="text-base font-medium text-foreground">
            Find your next job before everyone else.
          </p>
          <p>
            Euro48 finds the freshest job opportunities across Europe — only jobs posted in the last 48
            hours.
          </p>
          <p>No old listings. No duplicate jobs. No endless scrolling through outdated offers.</p>
          <p>Just fresh opportunities from across Europe, updated continuously.</p>
          <p>
            Search by job, country and city, find the latest opportunities instantly, and activate Email
            or Telegram alerts to be notified when a new matching job appears.
          </p>
          <p className="font-medium text-foreground">Fresh jobs. Last 48 hours. Across Europe.</p>
          <p className="font-medium text-accent-amber">Euro48 — Don&apos;t search yesterday&apos;s jobs.</p>
        </div>
      </div>

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
