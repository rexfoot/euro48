import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation d'Euro48, un radar d'offres d'emploi agrégées depuis leurs sources d'origine.",
  alternates: pageAlternates("/legal/terms"),
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-sm text-muted">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Conditions d&apos;utilisation</h1>

      <h2 className="mb-2 text-lg font-medium">1. Éditeur</h2>
      <p className="mb-4">
        Euro48 (euro48.com). Contact : hello@euro48.com.
        <br />
        Hébergement : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
      </p>

      <h2 className="mb-2 text-lg font-medium">2. Service</h2>
      <p className="mb-4">
        Euro48 est un moteur de recherche d&apos;offres d&apos;emploi. Nous regroupons des annonces publiées par des
        sources publiques (EURES, services publics de l&apos;emploi, Adzuna…) et renvoyons vers l&apos;annonce
        d&apos;origine. Euro48 n&apos;est ni employeur, ni recruteur, ni agence de placement, et ne perçoit aucun
        paiement des candidats.
      </p>

      <h2 className="mb-2 text-lg font-medium">3. Contenu des offres</h2>
      <p className="mb-4">
        Les annonces restent sous la responsabilité de leurs auteurs. Nous ne garantissons ni leur exactitude, ni
        leur disponibilité, ni l&apos;exhaustivité des offres en Europe. Les offres sont affichées 48 heures, puis
        retirées.
      </p>

      <h2 className="mb-2 text-lg font-medium">4. Liens partenaires</h2>
      <p className="mb-4">
        Certains liens (logement, équipement de la maison) sont des liens d&apos;affiliation. Si vous réservez ou
        achetez via ces liens, Euro48 peut percevoir une commission, sans aucun coût supplémentaire pour vous. En
        tant que Partenaire Amazon, Euro48 réalise un bénéfice sur les achats remplissant les conditions requises.
      </p>

      <h2 className="mb-2 text-lg font-medium">5. Responsabilité</h2>
      <p className="mb-4">
        Euro48 ne saurait être tenu responsable des contenus, services ou transactions des sites tiers vers lesquels
        il renvoie.
      </p>

      <h2 className="mb-2 text-lg font-medium">6. Droit applicable</h2>
      <p className="mb-8">Les présentes conditions sont soumises au droit français.</p>

      <h1 className="mb-4 text-2xl font-semibold text-foreground">Términos de uso</h1>

      <h2 className="mb-2 text-lg font-medium">1. Editor</h2>
      <p className="mb-4">
        Euro48 (euro48.com). Contacto: hello@euro48.com.
        <br />
        Alojamiento: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Estados Unidos.
      </p>

      <h2 className="mb-2 text-lg font-medium">2. Servicio</h2>
      <p className="mb-4">
        Euro48 es un motor de búsqueda de ofertas de empleo. Recopilamos anuncios publicados por fuentes públicas
        (EURES, servicios públicos de empleo, Adzuna…) y redirigimos al anuncio original. Euro48 no es empleador, ni
        reclutador, ni agencia de colocación, y no recibe ningún pago de los candidatos.
      </p>

      <h2 className="mb-2 text-lg font-medium">3. Contenido de las ofertas</h2>
      <p className="mb-4">
        Los anuncios son responsabilidad de sus autores. No garantizamos su exactitud, ni su disponibilidad, ni la
        exhaustividad de las ofertas en Europa. Las ofertas se muestran durante 48 horas y después se retiran.
      </p>

      <h2 className="mb-2 text-lg font-medium">4. Enlaces de afiliados</h2>
      <p className="mb-4">
        Algunos enlaces (alojamiento, equipamiento del hogar) son enlaces de afiliación. Si reservas o compras a
        través de estos enlaces, Euro48 puede percibir una comisión, sin ningún coste adicional para ti. Como
        Afiliado de Amazon, Euro48 obtiene beneficios por las compras que cumplan los requisitos aplicables.
      </p>

      <h2 className="mb-2 text-lg font-medium">5. Responsabilidad</h2>
      <p className="mb-4">
        Euro48 no se hace responsable de los contenidos, servicios o transacciones de los sitios de terceros a los
        que redirige.
      </p>

      <h2 className="mb-2 text-lg font-medium">6. Ley aplicable</h2>
      <p className="mb-8">Estas condiciones se rigen por el derecho francés.</p>

      <h1 className="mb-4 text-2xl font-semibold text-foreground">Terms of use</h1>

      <h2 className="mb-2 text-lg font-medium">1. Publisher</h2>
      <p className="mb-4">
        Euro48 (euro48.com). Contact: hello@euro48.com.
        <br />
        Hosting: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States.
      </p>

      <h2 className="mb-2 text-lg font-medium">2. Service</h2>
      <p className="mb-4">
        Euro48 is a job search engine. We aggregate listings published by public sources (EURES, public employment
        services, Adzuna…) and link back to the original listing. Euro48 is not an employer, recruiter, or
        placement agency, and never charges candidates.
      </p>

      <h2 className="mb-2 text-lg font-medium">3. Listing content</h2>
      <p className="mb-4">
        Listings remain the responsibility of their authors. We do not guarantee their accuracy, availability, or
        the completeness of job offers across Europe. Listings are shown for 48 hours, then removed.
      </p>

      <h2 className="mb-2 text-lg font-medium">4. Partner links</h2>
      <p className="mb-4">
        Some links (housing, home furnishing) are affiliate links. If you book or buy through these links, Euro48
        may earn a commission, at no extra cost to you. As an Amazon Associate, Euro48 earns from qualifying
        purchases.
      </p>

      <h2 className="mb-2 text-lg font-medium">5. Liability</h2>
      <p className="mb-4">
        Euro48 cannot be held responsible for the content, services, or transactions of third-party sites it links
        to.
      </p>

      <h2 className="mb-2 text-lg font-medium">6. Governing law</h2>
      <p>These terms are governed by French law.</p>
    </main>
  );
}
