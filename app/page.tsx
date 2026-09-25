export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="rounded-full border border-border bg-panel px-4 py-1 text-xs uppercase tracking-widest text-muted">
        Phase 0 — scaffold
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Euro<span className="text-accent-amber">48</span>
      </h1>
      <p className="max-w-md text-muted">
        Les offres d&apos;Europe des 48 dernières heures. Sans doublons.
      </p>
      <p className="max-w-md text-sm text-muted">
        Ofertas de Europa de las últimas 48 horas. Sin repeticiones. — Europe&apos;s jobs from the last 48 hours. No duplicates.
      </p>
    </main>
  );
}
