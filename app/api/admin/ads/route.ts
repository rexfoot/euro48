import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await query<{ id: string; image_url: string; link_url: string; title: string }>(
    "SELECT id, image_url, link_url, title FROM ads WHERE active = true ORDER BY created_at DESC"
  );
  return NextResponse.json({ ads: rows });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  if (!process.env.ADMIN_PASSWORD || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imageUrl, linkUrl, title } = body;

  if (!imageUrl || !linkUrl) {
    return NextResponse.json({ error: "imageUrl and linkUrl required" }, { status: 400 });
  }

  await query(
    "INSERT INTO ads (image_url, link_url, title) VALUES ($1, $2, $3)",
    [imageUrl, linkUrl, title ?? ""]
  );

  return NextResponse.json({ status: "ok" });
}
