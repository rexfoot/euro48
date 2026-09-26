import { NextRequest, NextResponse } from "next/server";
import { COUNTRY_CODES, type CountryCode } from "@/lib/constants";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public, read-only city search backing the country page's "any city,
// even with zero offers" search box — searches the full GeoNames set
// (lib/city-index / db/schema.sql `cities` table), not just cities that
// currently have offers.
export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get("country")?.toUpperCase() ?? "";
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  if (!COUNTRY_CODES.includes(country as CountryCode)) {
    return NextResponse.json({ error: "invalid country" }, { status: 400 });
  }
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const rows = await query<{ name: string }>(
    `SELECT name FROM (
       SELECT DISTINCT ON (name) name, population FROM cities
       WHERE country_code = $1 AND (ascii_name ILIKE $2 OR alt_names ILIKE $2)
       ORDER BY name, population DESC
     ) matched
     ORDER BY population DESC
     LIMIT 20`,
    [country, `%${q}%`]
  );

  return NextResponse.json({ results: rows.map((r) => r.name) });
}
