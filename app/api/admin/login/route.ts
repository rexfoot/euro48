import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, adminSessionCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "wrong_password" }, { status: 401 });
  }

  const cookie = adminSessionCookie();
  if (!cookie) {
    // ADMIN_PASSWORD isn't set in Vercel yet — checkAdminPassword already
    // returns false in that case, so this is unreachable in practice, but
    // kept as an explicit guard rather than trusting that invariant silently.
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const res = NextResponse.json({ status: "ok" });
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: cookie.maxAge,
    path: "/",
  });
  return res;
}
