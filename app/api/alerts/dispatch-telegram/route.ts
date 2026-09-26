import { NextRequest, NextResponse } from "next/server";
import { getActiveSubscriptions, getUndeliveredMatches, recordDeliveries, pruneOldDeliveries } from "@/lib/alerts";
import { sendTelegramMessage, telegramConfigured } from "@/lib/telegram";
import { telegramOfferMessage } from "@/lib/alert-messages";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PER_SUBSCRIPTION_CAP = 8; // never flood one subscriber in a single run

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.WORKER_SECRET || auth !== `Bearer ${process.env.WORKER_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!telegramConfigured()) {
    return NextResponse.json({ status: "ok", sent: 0, note: "telegram not configured" });
  }

  const subscriptions = await getActiveSubscriptions("telegram");
  let sent = 0;

  for (const subscription of subscriptions) {
    const matches = await getUndeliveredMatches(subscription, "telegram", PER_SUBSCRIPTION_CAP);
    const delivered: string[] = [];
    for (const offer of matches) {
      const ok = await sendTelegramMessage(subscription.telegram_chat_id!, telegramOfferMessage(offer));
      if (ok) {
        delivered.push(offer.id);
        sent++;
      }
    }
    await recordDeliveries(subscription.id, delivered, "telegram");
  }

  await pruneOldDeliveries();
  return NextResponse.json({ status: "ok", subscriptions: subscriptions.length, sent });
}
