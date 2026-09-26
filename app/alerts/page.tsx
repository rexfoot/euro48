import type { Metadata } from "next";
import { AlertsForm } from "@/components/AlertsForm";
import { pageAlternates } from "@/lib/seo";
import { AlertsHeader } from "@/components/AlertsHeader";

export const metadata: Metadata = {
  title: "Alertes / Alertas / Alerts",
  description: "Reçois par Telegram ou e-mail uniquement les offres qui correspondent à ton métier et tes pays.",
  alternates: pageAlternates("/alerts"),
};

export default function AlertsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <AlertsHeader />
      <div className="mt-6">
        <AlertsForm />
      </div>
    </main>
  );
}
