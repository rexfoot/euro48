import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSession, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { updateManualOffer, deleteManualOffer } from "@/lib/manual-offers";
import { parseInput } from "../route";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value);
}

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Props) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const input = parseInput(body);
  if (!input) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const result = await updateManualOffer(decodeURIComponent(id), input);
  if ("error" in result) {
    const status = result.error === "not_found" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ status: "ok" });
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const ok = await deleteManualOffer(decodeURIComponent(id));
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ status: "ok" });
}
