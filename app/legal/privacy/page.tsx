import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { PrivacyContent } from "@/components/PrivacyContent";

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Politique de confidentialité d'Euro48 : quelles données nous traitons et pendant combien de temps.",
  alternates: pageAlternates("/legal/privacy"),
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-sm text-muted">
      <PrivacyContent />
    </main>
  );
}
