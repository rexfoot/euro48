import type { Metadata } from "next";
import { deactivateSubscription } from "@/lib/alerts";
import { UnsubscribeMessage } from "@/components/UnsubscribeMessage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Unsubscribe",
  alternates: pageAlternates("/unsubscribe"),
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;
  const ok = token ? await deactivateSubscription(token) : false;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-16 text-center">
      <UnsubscribeMessage ok={ok} />
    </main>
  );
}
