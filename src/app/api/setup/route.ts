import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    return NextResponse.json({ ok: true, message: "Schema ready." });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: String(e) },
      { status: 500 }
    );
  }
}
