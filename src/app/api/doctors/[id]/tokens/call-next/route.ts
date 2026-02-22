import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/db";
import { todayDateString } from "@/lib/date";

export async function POST(
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
    const hospitalId = Number(session.user.hospitalId);
    const date = todayDateString();
    await sql`
      UPDATE tokens SET status = 'done', ended_at = NOW() WHERE doctor_id = ${doctorId} AND date = ${date} AND status = 'current'
    `;
    const { rows: nextRows } = await sql`
      SELECT id FROM tokens
      WHERE doctor_id = ${doctorId} AND date = ${date} AND status = 'waiting'
      ORDER BY token_number LIMIT 1
    `;
    if (nextRows.length) {
      await sql`
        UPDATE tokens SET status = 'current', started_at = NOW() WHERE id = ${nextRows[0].id}
      `;
    }
    const { rows } = await sql`
      SELECT t.id, t.token_number, t.patient_name, t.patient_unique_code, t.status
      FROM tokens t
      JOIN doctors d ON d.id = t.doctor_id
      WHERE d.id = ${doctorId} AND d.hospital_id = ${hospitalId} AND t.date = ${date}
      ORDER BY t.token_number
    `;
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
