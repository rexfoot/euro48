import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_CODES, LOCALES, SPECIALTY_IDS, type CountryCode, type Locale, type SpecialtyId } from "@/lib/constants";
import { createSubscription } from "@/lib/alerts";
import { telegramConfigured, telegramDeepLink } from "@/lib/telegram";
import { emailConfigured, sendEmail } from "@/lib/email";
import { alertStrings, unsubscribeUrl } from "@/lib/alert-messages";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown;
    telegram?: unknown;
    specialties?: unknown;
    countries?: unknown;
    keyword?: unknown;
    city?: unknown;
    locale?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const specialties = (Array.isArray(body.specialties) ? body.specialties : []).filter((s): s is SpecialtyId =>
    SPECIALTY_IDS.includes(s as SpecialtyId)
  );
  const countries = (Array.isArray(body.countries) ? body.countries : []).filter((c): c is CountryCode =>
    COUNTRY_CODES.includes(c as CountryCode)
  );
  const keyword = typeof body.keyword === "string" && body.keyword.trim() ? body.keyword.trim() : null;
  const city = typeof body.city === "string" && body.city.trim() ? body.city.trim() : null;
  const wantsTelegram = body.telegram === true;
  const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : null;
  const locale: Locale = (LOCALES as readonly string[]).includes(body.locale as string)
    ? (body.locale as Locale)
    : "fr";

  // A subscription from the standalone /alerts picker always has both a
  // specialty and a country (that form still requires them). A
  // search-created one (spec 2026-09-27) just needs at least one real
  // criterion — keyword, specialty, country or city — so it's never a
  // "notify me about literally everything" subscription.
  if (specialties.length === 0 && countries.length === 0 && !keyword && !city) {
    return NextResponse.json({ error: "no_criteria" }, { status: 400 });
  }
  if (!email && !wantsTelegram) return NextResponse.json({ error: "no_channel" }, { status: 400 });
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  if (wantsTelegram && !telegramConfigured()) return NextResponse.json({ error: "telegram_unavailable" }, { status: 503 });
  if (email && !emailConfigured()) return NextResponse.json({ error: "email_unavailable" }, { status: 503 });

  const subscription = await createSubscription({ email, wantsTelegram, specialties, countries, keyword, city, locale });

  if (subscription.channel_email && subscription.email) {
    const s = alertStrings(locale);
    await sendEmail(subscription.email, s.confirmSubject, s.confirmBody(unsubscribeUrl(subscription.id)));
  }

  const deepLink = subscription.channel_telegram ? telegramDeepLink(subscription.telegram_link_token!) : null;

  return NextResponse.json({ status: "ok", telegramLink: deepLink });
}
