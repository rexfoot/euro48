import { randomUUID } from "crypto";
import { query } from "./db";
import type { CountryCode, Locale, SpecialtyId } from "./constants";
import type { Offer } from "./offers";

export type AlertSubscription = {
  id: string;
  email: string | null;
  telegram_chat_id: string | null;
  telegram_link_token: string | null;
  specialties: SpecialtyId[];
  countries: CountryCode[];
  // Set when this subscription came from a search (job keyword + optional
  // city, 2026-09-27) rather than the standalone /alerts picker — NULL for
  // every older/plain subscription, meaning "no restriction there".
  keyword: string | null;
  city: string | null;
  channel_email: boolean;
  channel_telegram: boolean;
  active: boolean;
  locale: Locale;
  created_at: string;
};

export async function createSubscription(params: {
  email: string | null;
  wantsTelegram: boolean;
  specialties: SpecialtyId[];
  countries: CountryCode[];
  keyword?: string | null;
  city?: string | null;
  locale: Locale;
}): Promise<AlertSubscription> {
  const id = randomUUID();
  const telegramLinkToken = params.wantsTelegram ? randomUUID() : null;

  const rows = await query<AlertSubscription>(
    `INSERT INTO alert_subscriptions
       (id, email, telegram_link_token, specialties, countries, keyword, city, channel_email, channel_telegram, locale)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      id,
      params.email,
      telegramLinkToken,
      params.specialties,
      params.countries,
      params.keyword?.trim() || null,
      params.city?.trim() || null,
      Boolean(params.email),
      params.wantsTelegram,
      params.locale,
    ]
  );
  return rows[0];
}

export async function getSubscriptionByLinkToken(token: string): Promise<AlertSubscription | null> {
  const rows = await query<AlertSubscription>(
    `SELECT * FROM alert_subscriptions WHERE telegram_link_token = $1 AND active LIMIT 1`,
    [token]
  );
  return rows[0] ?? null;
}

export async function getSubscriptionByChatId(chatId: string): Promise<AlertSubscription | null> {
  const rows = await query<AlertSubscription>(
    `SELECT * FROM alert_subscriptions WHERE telegram_chat_id = $1 AND active LIMIT 1`,
    [chatId]
  );
  return rows[0] ?? null;
}

export async function linkTelegramChat(subscriptionId: string, chatId: string): Promise<void> {
  await query(`UPDATE alert_subscriptions SET telegram_chat_id = $2 WHERE id = $1`, [subscriptionId, chatId]);
}

export async function deactivateSubscription(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE alert_subscriptions SET active = false WHERE id = $1 AND active RETURNING id`,
    [id]
  );
  return rows.length > 0;
}

export async function deactivateByChatId(chatId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `UPDATE alert_subscriptions SET active = false WHERE telegram_chat_id = $1 AND active RETURNING id`,
    [chatId]
  );
  return rows.length > 0;
}

export async function getActiveSubscriptions(channel: "telegram" | "email"): Promise<AlertSubscription[]> {
  const column = channel === "telegram" ? "channel_telegram" : "channel_email";
  const extra = channel === "telegram" ? "AND telegram_chat_id IS NOT NULL" : "AND email IS NOT NULL";
  return query<AlertSubscription>(`SELECT * FROM alert_subscriptions WHERE active AND ${column} ${extra}`);
}

// Offers matching a subscription's filters that haven't been sent yet on
// this channel — the delivery table is the whole "only new matches" logic.
// An empty countries/specialties array (search-created subscriptions can
// have either, spec 2026-09-27) means "no restriction on that dimension" —
// every subscription from the standalone /alerts picker always has both
// non-empty, so this is a no-op for them.
export async function getUndeliveredMatches(
  subscription: AlertSubscription,
  channel: "telegram" | "email",
  limit = 20
): Promise<Offer[]> {
  const keywordPattern = subscription.keyword ? `%${subscription.keyword.replace(/[%_]/g, "\\$&")}%` : null;

  return query<Offer>(
    `SELECT o.* FROM offers o
     WHERE o.published_at >= now() - interval '48 hours'
       AND (array_length($1::text[], 1) IS NULL OR o.country_code = ANY($1))
       AND (array_length($2::text[], 1) IS NULL OR o.specialty = ANY($2))
       AND ($6::text IS NULL OR o.city = $6)
       AND ($7::text IS NULL OR o.title_original ILIKE $7 ESCAPE '\\' OR o.title_en ILIKE $7 ESCAPE '\\'
            OR o.title_fr ILIKE $7 ESCAPE '\\' OR o.title_es ILIKE $7 ESCAPE '\\' OR o.company ILIKE $7 ESCAPE '\\')
       AND NOT EXISTS (
         SELECT 1 FROM alert_deliveries d
         WHERE d.subscription_id = $3 AND d.offer_id = o.id AND d.channel = $4
       )
     ORDER BY o.published_at DESC
     LIMIT $5`,
    [subscription.countries, subscription.specialties, subscription.id, channel, limit, subscription.city, keywordPattern]
  );
}

export async function recordDeliveries(subscriptionId: string, offerIds: string[], channel: string): Promise<void> {
  if (offerIds.length === 0) return;
  const values: string[] = [];
  const params: unknown[] = [];
  offerIds.forEach((offerId, i) => {
    values.push(`($${i * 3 + 1},$${i * 3 + 2},$${i * 3 + 3})`);
    params.push(subscriptionId, offerId, channel);
  });
  await query(
    `INSERT INTO alert_deliveries (subscription_id, offer_id, channel) VALUES ${values.join(",")}
     ON CONFLICT DO NOTHING`,
    params
  );
}

// So a brand-new Telegram subscriber doesn't get flooded with the whole
// 48h backlog the moment they connect — only genuinely new offers from
// here on count as "new".
export async function markCurrentMatchesDelivered(subscription: AlertSubscription, channel: string): Promise<void> {
  const matches = await getUndeliveredMatches(subscription, channel as "telegram" | "email", 2000);
  await recordDeliveries(subscription.id, matches.map((o) => o.id), channel);
}

export async function pruneOldDeliveries(): Promise<void> {
  await query(`DELETE FROM alert_deliveries WHERE sent_at < now() - interval '7 days'`);
}
