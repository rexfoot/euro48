# Euro48

Radar en temps réel des offres d'emploi en Europe. Uniquement les offres
publiées dans les dernières 48h, dans une liste fermée de 15 pays, sans
doublons.

- FR : Les offres d'Europe des 48 dernières heures. Sans doublons.
- ES : Ofertas de Europa de las últimas 48 horas. Sin repeticiones.
- EN : Europe's jobs from the last 48 hours. No duplicates.

## Règles métier (non négociables)

- `published_at < 48h` → visible (globe + liste + ticker)
- `published_at >= 48h` → retiré de l'affichage (mais gardé en base)
- `published_at >= 72h` → supprimé définitivement de la base
- Lien mort (404 / expired) → supprimé immédiatement par le worker
- Doublon → n'entre pas ; on garde l'offre la plus fraîche
  (voir `lib/fingerprint.ts` : `normalize(company) + normalize(title) + city + country`)
- Tri par défaut : `published_at DESC`
- Plafond : ~2000 offres visibles au total ; au-delà, les plus vieilles sont éjectées
- 15 pays autorisés, 8 spécialités, villes listées — voir `lib/constants.ts`
  pour les listes fermées exactes. Rien en dehors de ces listes n'est jamais
  affiché (globe, ticker, base visible).

## Stack (100% gratuit)

- **Frontend** : Next.js App Router + Tailwind, hébergé sur Vercel (Hobby, gratuit)
- **Globe 3D** : react-globe.gl, fallback carte 2D si FPS < 30
- **DB** : Postgres (Neon ou Supabase, tier gratuit) — schéma dans `db/schema.sql`
- **Purge horaire** : `db/purge.sql` — hard delete >72h, cap 2000 offres visibles
- **Worker** : déclenché toutes les 10-15 min via **GitHub Actions cron**
  (pas le cron natif Vercel, limité à 1x/jour sur le plan Hobby)
- **Sources** : EURES (API publique), Adzuna (API gratuite avec inscription),
  puis France Travail / Arbeitsagentur / ATS publics plus tard

## Variables d'environnement

Voir `.env.example`. Ne jamais commiter de secrets.

- `DATABASE_URL` — connexion Postgres
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` — https://developer.adzuna.com/
- `WORKER_SECRET` — secret partagé entre GitHub Actions et `/api/worker/run`

## Structure

```
app/                 pages Next.js (App Router)
lib/constants.ts      listes fermées : pays, villes, spécialités, badges
lib/fingerprint.ts    dédoublonnage
lib/db.ts              pool Postgres
lib/offers.ts          requêtes + upsert des offres
db/schema.sql           schéma + contraintes
db/purge.sql            purge horaire (>72h delete, cap 2000)
```

## État actuel

Phase 0 (scaffold + design system + schema DB) en cours. Voir le worker,
le globe 3D et l'i18n dans les phases suivantes.

## Développement local

```bash
npm install
cp .env.example .env.local   # renseigner DATABASE_URL au minimum
npm run dev
```
