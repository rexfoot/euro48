-- Hourly purge job (spec section 3 + 8):
--   published_at >= 48h -> hidden from display (handled by app query filter, not deletion)
--   published_at >= 72h -> hard delete
--   dead links (404/expired) -> deleted by the worker as it detects them, not here
--   cap ~2000 visible offers -> evict oldest beyond the cap

-- 1. Hard delete anything older than 72h.
DELETE FROM offers
WHERE published_at < now() - interval '72 hours';

-- 2. Enforce the visible-offers cap: keep only the newest MAX_VISIBLE_OFFERS
--    among offers still inside the 48h visibility window; evict older ones
--    beyond the cap outright (per spec: "au-delà, éjecter les plus vieilles").
WITH ranked AS (
  SELECT id,
         row_number() OVER (ORDER BY published_at DESC) AS rn
  FROM offers
  WHERE published_at >= now() - interval '48 hours'
)
DELETE FROM offers
WHERE id IN (SELECT id FROM ranked WHERE rn > 2000);
