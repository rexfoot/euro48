"use client";

import { useEffect, useState } from "react";
import { useLocale } from "./LocaleProvider";
import { t } from "@/lib/i18n";

const DISMISS_KEY = "euro48_install_dismissed_at";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isDismissedRecently(): boolean {
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const days = (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
  return days < DISMISS_DAYS;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallAppBanner() {
  const { locale } = useLocale();
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || isDismissedRecently()) return;

    const ua = window.navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobile) return;

    navigator.serviceWorker?.register("/sw.js").catch(() => {});

    if (/iPhone|iPad|iPod/i.test(ua)) {
      const timer = setTimeout(() => setPlatform("ios"), 1200);
      return () => clearTimeout(timer);
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setPlatform(null);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    window.localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setDeferredPrompt(null);
    setPlatform(null);
  }

  if (!platform) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.3)] sm:hidden">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-amber text-sm font-bold text-background">
          48
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{t(locale, "install_title")}</p>
          <p className="truncate text-xs text-muted">
            {platform === "ios" ? t(locale, "install_ios_hint") : t(locale, "install_desc")}
          </p>
        </div>
        {platform === "android" && (
          <button
            onClick={install}
            className="shrink-0 rounded-lg bg-accent-amber px-3 py-1.5 text-sm font-semibold text-background"
          >
            {t(locale, "install_button")}
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label={t(locale, "install_dismiss")}
          className="shrink-0 px-1 text-lg leading-none text-muted"
        >
          ×
        </button>
      </div>
    </div>
  );
}
