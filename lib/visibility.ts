import { OFFER_VISIBLE_HOURS, OFFER_DELETE_HOURS } from "./constants";

// Every query that decides "is this offer currently shown" duplicated the
// same `published_at >= now() - interval '48 hours'` fragment in 5+ places
// (lib/offers.ts, lib/alerts.ts, the worker's purge). The admin panel's
// "keep this manual offer visible for 7/15/30 days" option (spec
// 2026-09-28) needed a carve-out added to all of them consistently, so
// they're centralized here instead. The OR is additive: every existing
// offer has expires_at NULL, so this behaves exactly as the old plain
// 48h check for them — only a manual offer with a real future expires_at
// gets the extra window.
export function visibleCondition(): string {
  return `(published_at >= now() - interval '${OFFER_VISIBLE_HOURS} hours' OR (expires_at IS NOT NULL AND expires_at > now()))`;
}

// Same additive logic for the worker's hard-delete: an offer past the
// normal 72h cutoff is still kept if it has its own not-yet-passed expiry.
export function purgeableCondition(): string {
  return `published_at < now() - interval '${OFFER_DELETE_HOURS} hours' AND (expires_at IS NULL OR expires_at <= now())`;
}
