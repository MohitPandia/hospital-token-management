import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.hospitalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hospitalId = Number(session.user.hospitalId);
  if (!Number.isInteger(hospitalId)) {
    return NextResponse.json({ error: "Invalid hospital" }, { status: 400 });
  }
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT id, name, contact, created_at
      FROM doctors
      WHERE hospital_id = ${hospitalId}
      ORDER BY name
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.hospitalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hospitalId = Number(session.user.hospitalId);
  if (!Number.isInteger(hospitalId)) {
    return NextResponse.json({ error: "Invalid hospital" }, { status: 400 });
  }
  try {
    await ensureSchema();
    const body = await req.json();
    const { name, contact } = body as { name?: string; contact?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const { rows } = await sql`
      INSERT INTO doctors (hospital_id, name, contact)
      VALUES (${hospitalId}, ${name.trim()}, ${contact?.trim() ?? null})
      RETURNING id, name, contact, created_at
    `;
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
