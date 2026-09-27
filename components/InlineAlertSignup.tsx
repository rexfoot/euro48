"use client";

import { useState } from "react";
import type { CountryCode, SpecialtyId } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; telegramLink: string | null; email: boolean };

// Shown under a search that found nothing (spec 2026-09-27) — subscribes
// using the exact same criteria the visitor just searched with (job
// keyword/specialty, country, city), through the same alert_subscriptions
// table and email/Telegram delivery the standalone /alerts page uses.
export function InlineAlertSignup({
  query,
  specialty,
  country,
  city,
}: {
  query?: string;
  specialty?: SpecialtyId;
  country?: CountryCode;
  city?: string;
}) {
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() && !telegram) return setStatus({ kind: "error", message: t(locale, "alerts_pick_one_channel") });
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setStatus({ kind: "error", message: t(locale, "alerts_email_invalid") });
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialties: specialty ? [specialty] : [],
          countries: country ? [country] : [],
          keyword: !specialty && query ? query : undefined,
          city: city || undefined,
          telegram,
          email: email.trim() || undefined,
          locale,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setStatus({ kind: "success", telegramLink: data.telegramLink ?? null, email: Boolean(email.trim()) });
    } catch {
      setStatus({ kind: "error", message: t(locale, "alerts_error") });
    } finally {
      setSubmitting(false);
    }
  }

  if (status.kind === "success") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-panel p-6 text-center">
        {status.email && <p className="text-foreground">{t(locale, "alerts_success_email")}</p>}
        {status.telegramLink && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-foreground">{t(locale, "alerts_success_telegram")}</p>
            <a
              href={status.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-amber px-4 py-2 text-sm font-medium text-[#070B14] transition-opacity hover:opacity-90"
            >
              Telegram →
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-accent-blue/40 bg-panel p-6">
      <p className="text-center text-foreground">{t(locale, "no_offers_search")}</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t(locale, "alerts_email_placeholder")}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent-blue/50"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={telegram} onChange={(e) => setTelegram(e.target.checked)} className="h-4 w-4" />
        {t(locale, "alerts_telegram_label")}
      </label>
      {status.kind === "error" && <p className="text-sm text-accent-red">{status.message}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="self-center rounded-full bg-accent-blue px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {t(locale, "alerts_submit")}
      </button>
    </form>
  );
}
