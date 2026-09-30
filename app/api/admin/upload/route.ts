import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.ADMIN_PASSWORD}`;
  if (!process.env.ADMIN_PASSWORD || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `ads/${Date.now()}.${ext}`;

  await query(
    "INSERT INTO ads (image_url, link_url, title) VALUES ($1, $2, $3)",
    [`/api/ads/image/${filename}`, "", ""]
  );

  return NextResponse.json({ url: `/api/ads/image/${filename}`, filename });
}
