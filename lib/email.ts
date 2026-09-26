// Resend REST API directly (no SDK dependency) — free tier, used only for
// the alert digest + confirmation emails (spec 2026-09-27).
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.ALERTS_FROM_EMAIL || "Euro48 <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return Boolean(API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
