import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidAdminSession, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { listManualOffers, createManualOffer, type ManualOfferInput } from "@/lib/manual-offers";
import { COUNTRY_CODES, SPECIALTY_IDS, type CountryCode, type SpecialtyId } from "@/lib/constants";

async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminSession(store.get(ADMIN_COOKIE_NAME)?.value);
}

function isCountryCode(v: unknown): v is CountryCode {
  return typeof v === "string" && COUNTRY_CODES.includes(v as CountryCode);
}

function isSpecialtyId(v: unknown): v is SpecialtyId {
  return typeof v === "string" && SPECIALTY_IDS.includes(v as SpecialtyId);
}

export function parseInput(body: unknown): ManualOfferInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.title !== "string" ||
    typeof b.company !== "string" ||
    typeof b.city !== "string" ||
    typeof b.contact !== "string" ||
    !isCountryCode(b.countryCode) ||
    !isSpecialtyId(b.specialty)
  ) {
    return null;
  }
  const visibilityDays = b.visibilityDays === 7 || b.visibilityDays === 15 || b.visibilityDays === 30 ? b.visibilityDays : null;
  return {
    title: b.title,
    company: b.company,
    countryCode: b.countryCode,
    city: b.city,
    specialty: b.specialty,
    contact: b.contact,
    description: typeof b.description === "string" && b.description.trim() ? b.description.trim() : null,
    visibilityDays,
  };
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const offers = await listManualOffers();
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const input = parseInput(body);
  if (!input) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const result = await createManualOffer(input);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ status: "ok" });
}
