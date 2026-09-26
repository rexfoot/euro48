-- Euro48 schema. Minimal fields only — no long description stored (spec section 3).

CREATE TABLE IF NOT EXISTS offers (
  id              TEXT PRIMARY KEY,               -- source-provided id or generated uuid
  title_original  TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  title_fr        TEXT NOT NULL,
  title_es        TEXT NOT NULL,
  company         TEXT NOT NULL,
  country_code    TEXT NOT NULL,                   -- one of the 15 allowed ISO codes
  city            TEXT NOT NULL,
  specialty       TEXT NOT NULL,                   -- one of the 8 allowed specialty ids
  contract_type   TEXT,
  salary_raw      TEXT,
  remote          BOOLEAN NOT NULL DEFAULT FALSE,
  language_of_ad  TEXT NOT NULL,
  url             TEXT NOT NULL,
  source          TEXT NOT NULL,                   -- eures | adzuna | ...
  published_at    TIMESTAMPTZ NOT NULL,
  fingerprint     TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dedup: only one row per fingerprint (spec section 3).
CREATE UNIQUE INDEX IF NOT EXISTS offers_fingerprint_unique ON offers (fingerprint);

-- Default sort: newest first.
CREATE INDEX IF NOT EXISTS offers_published_at_desc ON offers (published_at DESC);

-- Country -> city -> specialty browse path (spec section 5 UX flow).
CREATE INDEX IF NOT EXISTS offers_country_city_specialty ON offers (country_code, city, specialty);

-- Enforce the closed lists at the DB level too, not just in app code.
ALTER TABLE offers
  ADD CONSTRAINT offers_country_code_allowed
  CHECK (country_code IN ('DE','NL','CH','LU','BE','AT','IE','FR','ES','IT','NO','DK','SE','FI','IS'));

ALTER TABLE offers
  ADD CONSTRAINT offers_specialty_allowed
  CHECK (specialty IN ('hospitality','logistics','healthcare','construction','retail','industry','transport','it'));

-- Per-source rotation state (e.g. "which country/page did EURES/Adzuna
-- fetch last run") so successive worker runs sample a wider slice of each
-- source instead of re-fetching the same top results every time.
CREATE TABLE IF NOT EXISTS worker_cursors (
  source     TEXT PRIMARY KEY,
  cursor     JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full GeoNames "cities1000" reference for our 15 countries (2026-09-26):
-- every real city/town with population >= 1000, with alternate names in
-- other languages/scripts. Used to (a) recognize the real city behind an
-- offer's raw location text, replacing the old hand-written closed list,
-- and (b) let the country page's city search find any real city even
-- with zero current offers. Loaded once via scripts/import-geonames — not
-- meant to change often, so no auto-refresh job for it.
CREATE TABLE IF NOT EXISTS cities (
  geoname_id   INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  ascii_name   TEXT NOT NULL,
  alt_names    TEXT,
  country_code TEXT NOT NULL,
  population   INTEGER NOT NULL DEFAULT 0,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL
);

CREATE INDEX IF NOT EXISTS cities_country_ascii_idx ON cities (country_code, ascii_name);

-- Where each offer's matched city actually is — lets the "no offers here"
-- empty state suggest the nearest cities that do have some, by real
-- distance instead of guessing.
ALTER TABLE offers ADD COLUMN IF NOT EXISTS city_lat DOUBLE PRECISION;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS city_lng DOUBLE PRECISION;
