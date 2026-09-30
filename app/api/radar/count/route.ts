import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { visibleCondition } from "@/lib/visibility";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await query<{ count: string }>(
    `SELECT count(*) FROM offers WHERE eligibility IN ('A', 'B') AND ${visibleCondition()}`
  );
  return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
}
