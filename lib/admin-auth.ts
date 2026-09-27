import { createHmac, timingSafeEqual } from "crypto";

// Password lives only in Vercel's ADMIN_PASSWORD env var (spec 2026-09-28)
// — never in code, never in the database. The session cookie is an HMAC of
// a fixed string keyed by that password, not the password itself: it's
// deterministic (every login gets the same token, no session storage
// needed) and self-invalidating (changing ADMIN_PASSWORD in Vercel
// instantly logs everyone out, since old cookies no longer match the new
// HMAC).
export const ADMIN_COOKIE_NAME = "euro48_admin";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — a phone shouldn't need re-login often

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function sessionToken(): string | null {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return createHmac("sha256", secret).update("euro48-admin-session").digest("hex");
}

export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(password, expected);
}

export function isValidAdminSession(cookieValue: string | undefined): boolean {
  const token = sessionToken();
  if (!token || !cookieValue) return false;
  return safeEqual(cookieValue, token);
}

export function adminSessionCookie(): { name: string; value: string; maxAge: number } | null {
  const token = sessionToken();
  if (!token) return null;
  return { name: ADMIN_COOKIE_NAME, value: token, maxAge: ADMIN_COOKIE_MAX_AGE };
}
