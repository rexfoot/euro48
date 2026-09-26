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
