import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/constants";
import {
  getSubscriptionByLinkToken,
  linkTelegramChat,
  markCurrentMatchesDelivered,
  deactivateByChatId,
} from "@/lib/alerts";
import { sendTelegramMessage, isStopMessage } from "@/lib/telegram";
import { alertStrings } from "@/lib/alert-messages";

export const dynamic = "force-dynamic";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { language_code?: string };
  };
};

function pickLocale(code: string | undefined): Locale {
  if (code === "fr" || code === "es") return code;
  return "en";
}

export async function POST(req: NextRequest) {
  // Telegram-set secret (see setup notes) — anyone else's POST is ignored.
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expected && req.headers.get("x-telegram-bot-api-secret-token") !== expected) {
    return NextResponse.json({ ok: true }); // don't leak info to probes
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (!message?.text) return NextResponse.json({ ok: true });

  const chatId = String(message.chat.id);
  const text = message.text.trim();
  const locale = pickLocale(message.from?.language_code);
  const s = alertStrings(locale);

  if (text.startsWith("/start")) {
    const token = text.split(/\s+/)[1];
    const subscription = token ? await getSubscriptionByLinkToken(token) : null;
    if (!subscription) {
      await sendTelegramMessage(chatId, s.telegramInvalidLink);
      return NextResponse.json({ ok: true });
    }
    await linkTelegramChat(subscription.id, chatId);
    await markCurrentMatchesDelivered({ ...subscription, telegram_chat_id: chatId }, "telegram");
    await sendTelegramMessage(chatId, alertStrings(subscription.locale).telegramWelcome);
    return NextResponse.json({ ok: true });
  }

  if (isStopMessage(text)) {
    const deactivated = await deactivateByChatId(chatId);
    await sendTelegramMessage(chatId, deactivated ? s.telegramStopped : s.telegramNotSubscribed);
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(chatId, s.telegramHint);
  return NextResponse.json({ ok: true });
}
