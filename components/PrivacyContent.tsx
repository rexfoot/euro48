"use client";

import { useLocale } from "./LocaleProvider";

export function PrivacyContent() {
  const { locale } = useLocale();

  if (locale === "es") {
    return (
      <>
        <h1 className="mb-4 text-2xl font-semibold text-foreground">Política de privacidad</h1>

        <h2 className="mb-2 text-lg font-medium">1. Responsable</h2>
        <p className="mb-4">El editor de Euro48 — hello@euro48.com.</p>

        <h2 className="mb-2 text-lg font-medium">2. Consulta libre</h2>
        <p className="mb-4">No es necesario registrarse para consultar las ofertas.</p>

        <h2 className="mb-2 text-lg font-medium">3. Alertas</h2>
        <p className="mb-4">
          Si te suscribes a las alertas, conservamos tu dirección de email y/o tu identificador de Telegram (según
          el canal elegido), junto con tus criterios de búsqueda, únicamente para enviarte las ofertas que
          coincidan. Puedes darte de baja en cualquier momento — mediante el enlace presente en cada email, o
          enviando «stop» al bot de Telegram — lo que elimina definitivamente tus datos.
        </p>

        <h2 className="mb-2 text-lg font-medium">4. Enlaces de afiliados</h2>
        <p className="mb-4">
          Euro48 no muestra banners publicitarios. Al hacer clic en un enlace de afiliado (Booking.com, Amazon),
          sales de Euro48: esos sitios pueden colocar sus propias cookies, según su propia política de privacidad.
        </p>

        <h2 className="mb-2 text-lg font-medium">5. Sin reventa</h2>
        <p className="mb-4">No vendemos ni alquilamos ningún dato personal.</p>

        <h2 className="mb-2 text-lg font-medium">6. Subcontratistas</h2>
        <p className="mb-4">Alojamiento: Vercel Inc. (Estados Unidos). Base de datos: Neon.</p>

        <h2 className="mb-2 text-lg font-medium">7. Tus derechos (RGPD)</h2>
        <p>
          Tienes derecho de acceso, rectificación y supresión de tus datos: escribe a hello@euro48.com. También
          puedes contactar con la CNIL (www.cnil.fr) o tu autoridad de protección de datos local.
        </p>
      </>
    );
  }

  if (locale === "en") {
    return (
      <>
        <h1 className="mb-4 text-2xl font-semibold text-foreground">Privacy policy</h1>

        <h2 className="mb-2 text-lg font-medium">1. Data controller</h2>
        <p className="mb-4">Euro48&apos;s publisher — hello@euro48.com.</p>

        <h2 className="mb-2 text-lg font-medium">2. Free browsing</h2>
        <p className="mb-4">No sign-up is required to browse listings.</p>

        <h2 className="mb-2 text-lg font-medium">3. Alerts</h2>
        <p className="mb-4">
          If you subscribe to alerts, we store your email address and/or your Telegram identifier (depending on the
          channel you choose), along with your search criteria, solely to send you matching listings. You can
          unsubscribe at any time — via the link in every email, or by sending &quot;stop&quot; to the Telegram bot
          — which permanently deletes your data.
        </p>

        <h2 className="mb-2 text-lg font-medium">4. Partner links</h2>
        <p className="mb-4">
          Euro48 does not display ad banners. When you click a partner link (Booking.com, Amazon), you leave
          Euro48: those sites may set their own cookies, under their own privacy policy.
        </p>

        <h2 className="mb-2 text-lg font-medium">5. No reselling</h2>
        <p className="mb-4">We do not sell or rent any personal data.</p>

        <h2 className="mb-2 text-lg font-medium">6. Subprocessors</h2>
        <p className="mb-4">Hosting: Vercel Inc. (United States). Database: Neon.</p>

        <h2 className="mb-2 text-lg font-medium">7. Your rights (GDPR)</h2>
        <p>
          You have the right to access, rectify, and delete your data: write to hello@euro48.com. You may also
          contact the CNIL (www.cnil.fr) or your local data protection authority.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Politique de confidentialité</h1>

      <h2 className="mb-2 text-lg font-medium">1. Responsable</h2>
      <p className="mb-4">L&apos;éditeur d&apos;Euro48 — hello@euro48.com.</p>

      <h2 className="mb-2 text-lg font-medium">2. Consultation libre</h2>
      <p className="mb-4">Aucune inscription n&apos;est nécessaire pour consulter les offres.</p>

      <h2 className="mb-2 text-lg font-medium">3. Alertes</h2>
      <p className="mb-4">
        Si vous vous abonnez aux alertes, nous conservons votre adresse e-mail et/ou votre identifiant Telegram
        (selon le canal choisi), ainsi que vos critères de recherche, uniquement pour vous envoyer les offres
        correspondantes. Vous pouvez vous désabonner à tout moment — via le lien présent dans chaque e-mail, ou en
        envoyant « stop » au bot Telegram — ce qui supprime définitivement vos données.
      </p>

      <h2 className="mb-2 text-lg font-medium">4. Liens partenaires</h2>
      <p className="mb-4">
        Euro48 n&apos;affiche pas de bannières publicitaires. Lorsque vous cliquez sur un lien partenaire
        (Booking.com, Amazon), vous quittez Euro48 : ces sites peuvent déposer leurs propres cookies, selon leur
        propre politique de confidentialité.
      </p>

      <h2 className="mb-2 text-lg font-medium">5. Aucune revente</h2>
      <p className="mb-4">Nous ne vendons ni ne louons aucune donnée personnelle.</p>

      <h2 className="mb-2 text-lg font-medium">6. Sous-traitants</h2>
      <p className="mb-4">Hébergement : Vercel Inc. (États-Unis). Base de données : Neon.</p>

      <h2 className="mb-2 text-lg font-medium">7. Vos droits (RGPD)</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données : écrivez à
        hello@euro48.com. Vous pouvez aussi saisir la CNIL (www.cnil.fr).
      </p>
    </>
  );
}
