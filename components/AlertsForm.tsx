"use client";

import { useState } from "react";
import { COUNTRIES, SPECIALTIES, type CountryCode, type SpecialtyId } from "@/lib/constants";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; telegramLink: string | null; email: boolean };

export function AlertsForm() {
  const { locale } = useLocale();
  const [specialties, setSpecialties] = useState<SpecialtyId[]>([]);
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [submitting, setSubmitting] = useState(false);

  function toggle<T>(list: T[], value: T, setList: (v: T[]) => void) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (specialties.length === 0) return setStatus({ kind: "error", message: t(locale, "alerts_pick_one_specialty") });
    if (countries.length === 0) return setStatus({ kind: "error", message: t(locale, "alerts_pick_one_country") });
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
          specialties,
          countries,
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
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium">{t(locale, "alerts_specialty_label")}</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => toggle(specialties, s.id, setSpecialties)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                specialties.includes(s.id)
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-border bg-panel text-muted hover:text-foreground"
              }`}
            >
              {s.name[locale]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">{t(locale, "alerts_country_label")}</p>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              type="button"
              key={c.code}
              onClick={() => toggle(countries, c.code, setCountries)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                countries.includes(c.code)
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-border bg-panel text-muted hover:text-foreground"
              }`}
            >
              {c.name[locale]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">{t(locale, "alerts_email_label")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t(locale, "alerts_email_placeholder")}
            className="w-full rounded-xl border border-border bg-panel px-4 py-2.5 text-sm outline-none focus:border-accent-amber/50"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={telegram} onChange={(e) => setTelegram(e.target.checked)} className="h-4 w-4" />
          {t(locale, "alerts_telegram_label")}
        </label>
      </div>

      {status.kind === "error" && <p className="text-sm text-accent-red">{status.message}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-fit items-center gap-1 rounded-full bg-accent-amber px-5 py-2.5 text-sm font-medium text-[#070B14] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {t(locale, "alerts_submit")}
      </button>
    </form>
  );
}
