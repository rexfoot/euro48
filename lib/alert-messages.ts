import type { Locale } from "./constants";
import type { Offer } from "./offers";
import { SITE_URL } from "./constants";

const STRINGS: Record<Locale, {
  confirmSubject: string;
  confirmBody: (unsubscribeUrl: string) => string;
  digestSubject: (n: number) => string;
  digestIntro: string;
  unsubscribeCta: string;
  telegramWelcome: string;
  telegramInvalidLink: string;
  telegramStopped: string;
  telegramNotSubscribed: string;
  telegramHint: string;
}> = {
  fr: {
    confirmSubject: "Euro48 — Alertes activées",
    confirmBody: (u) =>
      `<p>Tes alertes Euro48 sont actives. Tu recevras un résumé des offres qui correspondent, 1 à 2 fois par jour.</p><p><a href="${u}">Se désabonner</a></p>`,
    digestSubject: (n) => `Euro48 — ${n} nouvelle${n > 1 ? "s" : ""} offre${n > 1 ? "s" : ""}`,
    digestIntro: "Voici les offres qui correspondent à tes alertes :",
    unsubscribeCta: "Se désabonner",
    telegramWelcome: "✅ Alertes Telegram activées. Écris \"stop\" à tout moment pour te désabonner.",
    telegramInvalidLink: "Ce lien n'est plus valide.",
    telegramStopped: "Alertes désactivées. Tu ne recevras plus rien ici.",
    telegramNotSubscribed: "Tu n'as pas d'alertes actives sur ce compte.",
    telegramHint: "Ce bot envoie uniquement les alertes Euro48. Écris \"stop\" pour te désabonner.",
  },
  es: {
    confirmSubject: "Euro48 — Alertas activadas",
    confirmBody: (u) =>
      `<p>Tus alertas de Euro48 están activas. Recibirás un resumen de las ofertas que coincidan, 1-2 veces al día.</p><p><a href="${u}">Darse de baja</a></p>`,
    digestSubject: (n) => `Euro48 — ${n} oferta${n > 1 ? "s" : ""} nueva${n > 1 ? "s" : ""}`,
    digestIntro: "Estas son las ofertas que coinciden con tus alertas:",
    unsubscribeCta: "Darse de baja",
    telegramWelcome: "✅ Alertas de Telegram activadas. Escribe \"stop\" cuando quieras darte de baja.",
    telegramInvalidLink: "Este enlace ya no es válido.",
    telegramStopped: "Alertas desactivadas. No recibirás más avisos aquí.",
    telegramNotSubscribed: "No tienes alertas activas en esta cuenta.",
    telegramHint: "Este bot solo envía las alertas de Euro48. Escribe \"stop\" para darte de baja.",
  },
  en: {
    confirmSubject: "Euro48 — Alerts turned on",
    confirmBody: (u) =>
      `<p>Your Euro48 alerts are active. You'll get a digest of matching offers, 1-2 times a day.</p><p><a href="${u}">Unsubscribe</a></p>`,
    digestSubject: (n) => `Euro48 — ${n} new offer${n > 1 ? "s" : ""}`,
    digestIntro: "Here are the offers matching your alerts:",
    unsubscribeCta: "Unsubscribe",
    telegramWelcome: "✅ Telegram alerts on. Send \"stop\" anytime to unsubscribe.",
    telegramInvalidLink: "This link is no longer valid.",
    telegramStopped: "Alerts turned off. You won't get anything else here.",
    telegramNotSubscribed: "You don't have active alerts on this account.",
    telegramHint: "This bot only sends Euro48 alerts. Send \"stop\" to unsubscribe.",
  },
};

export function alertStrings(locale: Locale) {
  return STRINGS[locale] ?? STRINGS.en;
}

export function telegramOfferMessage(offer: Offer): string {
  return `🔔 ${offer.title_original}\n${offer.company} · ${offer.city} · ${offer.country_code} · ${offer.language_of_ad.toUpperCase()}\n${offer.url}`;
}

export function digestHtml(offers: Offer[], locale: Locale, unsubscribeUrl: string): string {
  const s = alertStrings(locale);
  const items = offers
    .map(
      (o) =>
        `<li><a href="${o.url}">${o.title_original}</a> — ${o.company} · ${o.city} · ${o.country_code} · ${o.language_of_ad.toUpperCase()}</li>`
    )
    .join("");
  return `<p>${s.digestIntro}</p><ul>${items}</ul><p><a href="${unsubscribeUrl}">${s.unsubscribeCta}</a></p>`;
}

export function unsubscribeUrl(subscriptionId: string): string {
  return `${SITE_URL}/unsubscribe?token=${encodeURIComponent(subscriptionId)}`;
}
