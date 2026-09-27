import type { Metadata } from "next";
import { cookies } from "next/headers";
import { isValidAdminSession, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

// Never indexed — this is a private tool, not a public page.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const store = await cookies();
  const authed = isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
      {authed ? <AdminDashboard /> : <AdminLogin />}
    </main>
  );
}
