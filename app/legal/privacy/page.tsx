export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-sm text-muted">
      <h1 className="mb-4 text-2xl font-semibold text-foreground">Confidentialité</h1>
      <p className="mb-4">
        Euro48 n&apos;exige aucune inscription pour consulter les offres. Nous
        n&apos;affichons aucune publicité tierce ni ne revendons de données
        personnelles.
      </p>
      <p className="mb-4">
        Les seules données que nous traitons sont les offres d&apos;emploi
        publiques collectées via des API légales (EURES, Adzuna, et
        équivalents), pour la durée strictement nécessaire à leur affichage
        (72h maximum, ensuite supprimées).
      </p>
      <p>Contact : hello@euro48.com</p>
    </main>
  );
}
