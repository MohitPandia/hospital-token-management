import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/db";
import { todayDateString, normalizeDateForResponse } from "@/lib/date";
import { getAvgConsultationMinutes, estimateVisitTime, formatIST } from "@/lib/estimate";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json(
      { error: "Missing code. Use ?code=YOUR_CODE" },
      { status: 400 }
    );
  }
  try {
    await ensureSchema();
    const { rows } = await sql`
      SELECT t.id, t.doctor_id, t.date, t.patient_unique_code, t.patient_name, t.token_number, t.status,
             d.name as doctor_name, h.name as hospital_name
      FROM tokens t
      JOIN doctors d ON d.id = t.doctor_id
      JOIN hospitals h ON h.id = d.hospital_id
      WHERE t.patient_unique_code = ${code} LIMIT 1
    `;
    const token = rows[0];
    if (!token) {
      return NextResponse.json(
        { error: "No token found for this code." },
        { status: 404 }
      );
    }
    const date = normalizeDateForResponse(token.date);
    const today = todayDateString();
    if (date !== today) {
      return NextResponse.json({
        tokenNumber: token.token_number,
        patientName: token.patient_name,
        doctorName: token.doctor_name,
        hospitalName: token.hospital_name,
        status: token.status,
        date,
        message: "This token is not for today. Please check the date with the hospital.",
      });
    }
    const doctorId = Number(token.doctor_id);
    const status = token.status as string;
    const { rows: queueRows } = await sql`
      SELECT id, token_number, status FROM tokens
      WHERE doctor_id = ${doctorId} AND date = ${date}
      ORDER BY token_number
    `;
    let positionInQueue = 0;
    let found = false;
    for (let i = 0; i < queueRows.length; i++) {
      const r = queueRows[i];
      if (r.status === "current" || r.status === "waiting") {
        positionInQueue++;
        if (Number(r.id) === Number(token.id)) {
          found = true;
          break;
        }
      }
    }
    if (!found) positionInQueue = 0;
    const avgMinutes = await getAvgConsultationMinutes(doctorId);
    const { estimatedAt, minutesFromNow } = estimateVisitTime(
      positionInQueue,
      avgMinutes
    );
    const estimatedIST = formatIST(estimatedAt);
    return NextResponse.json({
      tokenNumber: token.token_number,
      patientName: token.patient_name,
      doctorName: token.doctor_name,
      hospitalName: token.hospital_name,
      status,
      date,
      positionInQueue: positionInQueue > 0 ? positionInQueue : null,
      estimatedIST: positionInQueue > 0 ? estimatedIST : null,
      minutesFromNow: positionInQueue > 0 ? minutesFromNow : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
