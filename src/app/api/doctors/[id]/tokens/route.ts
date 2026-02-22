import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/db";
import { todayDateString, normalizeDateForResponse } from "@/lib/date";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.hospitalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const doctorId = Number((await params).id);
  if (!Number.isInteger(doctorId)) {
    return NextResponse.json({ error: "Invalid doctor" }, { status: 400 });
  }
  try {
    await ensureSchema();
    const date = todayDateString();
    const { rows } = await sql`
      SELECT t.id, t.date, t.patient_unique_code, t.patient_name, t.token_number, t.status, t.started_at, t.ended_at, t.created_at
      FROM tokens t
      JOIN doctors d ON d.id = t.doctor_id
      WHERE d.id = ${doctorId} AND d.hospital_id = ${Number(session.user.hospitalId)} AND t.date = ${date}
      ORDER BY t.token_number
    `;
    const normalized = (rows as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      date: normalizeDateForResponse(r.date),
    }));
    return NextResponse.json(normalized);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.hospitalId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const doctorId = Number((await params).id);
  if (!Number.isInteger(doctorId)) {
    return NextResponse.json({ error: "Invalid doctor" }, { status: 400 });
  }
  try {
    await ensureSchema();
    const { rows: docRows } = await sql`
      SELECT id FROM doctors WHERE id = ${doctorId} AND hospital_id = ${Number(session.user.hospitalId)} LIMIT 1
    `;
    if (!docRows.length) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    const body = await req.json();
    const patientName = (body.patientName as string)?.trim() ?? "";
    const rawDate = (body.date as string)?.trim();
    const today = todayDateString();
    const date =
      rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate.slice(0, 10) : today;
    const { rows: maxRows } = await sql`
      SELECT COALESCE(MAX(token_number), 0) as mx FROM tokens WHERE doctor_id = ${doctorId} AND date = ${date}
    `;
    const nextNum = Number((maxRows[0] as { mx?: number } | undefined)?.mx ?? 0) + 1;
    const { customAlphabet } = await import("nanoid");
    const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);
    const patientUniqueCode = nanoid();
    await sql`
      INSERT INTO tokens (doctor_id, date, patient_unique_code, patient_name, token_number, status)
      VALUES (${doctorId}, ${date}, ${patientUniqueCode}, ${patientName || null}, ${nextNum}, 'waiting')
    `;
    return NextResponse.json({
      patientUniqueCode,
      tokenNumber: nextNum,
      patientName: patientName || null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
