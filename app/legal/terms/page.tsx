import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { TermsContent } from "@/components/TermsContent";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation d'Euro48, un radar d'offres d'emploi agrégées depuis leurs sources d'origine.",
  alternates: pageAlternates("/legal/terms"),
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-sm text-muted">
      <TermsContent />
    </main>
  );
}
