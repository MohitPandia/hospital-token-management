import { NextRequest, NextResponse } from "next/server";
import { createHospitalAndUser } from "@/lib/auth";
import { ensureSchema } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { hospitalName, email, password, contact } = body as {
      hospitalName?: string;
      email?: string;
      password?: string;
      contact?: string;
    };
    if (!hospitalName?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "hospitalName, email and password are required" },
        { status: 400 }
      );
    }
    await createHospitalAndUser(
      hospitalName.trim(),
      email.trim().toLowerCase(),
      password,
      typeof contact === "string" ? contact.trim() : undefined
    );
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
