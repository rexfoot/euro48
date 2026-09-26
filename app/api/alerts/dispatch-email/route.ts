import { NextRequest, NextResponse } from "next/server";
import { getActiveSubscriptions, getUndeliveredMatches, recordDeliveries, pruneOldDeliveries } from "@/lib/alerts";
import { sendEmail, emailConfigured } from "@/lib/email";
import { alertStrings, digestHtml, unsubscribeUrl } from "@/lib/alert-messages";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PER_SUBSCRIPTION_CAP = 30;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.WORKER_SECRET || auth !== `Bearer ${process.env.WORKER_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) {
    return NextResponse.json({ status: "ok", sent: 0, note: "email not configured" });
  }

  const subscriptions = await getActiveSubscriptions("email");
  let sent = 0;

  for (const subscription of subscriptions) {
    const matches = await getUndeliveredMatches(subscription, "email", PER_SUBSCRIPTION_CAP);
    if (matches.length === 0) continue; // never send an empty digest

    const s = alertStrings(subscription.locale);
    const html = digestHtml(matches, subscription.locale, unsubscribeUrl(subscription.id));
    const ok = await sendEmail(subscription.email!, s.digestSubject(matches.length), html);
    if (ok) {
      await recordDeliveries(subscription.id, matches.map((o) => o.id), "email");
      sent++;
    }
  }

  await pruneOldDeliveries();
  return NextResponse.json({ status: "ok", subscriptions: subscriptions.length, sent });
}
