// Minimal Telegram Bot API wrapper — no chat/support flow, just deep-link
// connect, deliver alerts, and accept "stop" (spec 2026-09-27).
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export function telegramConfigured(): boolean {
  return Boolean(BOT_TOKEN);
}

export function telegramDeepLink(linkToken: string): string | null {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) return null;
  return `https://t.me/${username}?start=${linkToken}`;
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const STOP_WORDS = ["stop", "arret", "arrêt", "parar", "baja", "cancelar", "unsubscribe"];

export function isStopMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return STOP_WORDS.some((w) => normalized === w || normalized === `/${w}`);
}
