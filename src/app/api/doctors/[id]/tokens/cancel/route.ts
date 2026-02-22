import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql, ensureSchema } from "@/lib/db";
import { todayDateString, normalizeDateForResponse } from "@/lib/date";

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
  let tokenId: number;
  try {
    const body = await req.json();
    tokenId = Number(body.tokenId);
    if (!Number.isInteger(tokenId)) {
      return NextResponse.json(
        { error: "Invalid tokenId" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }
  try {
    await ensureSchema();
    const hospitalId = Number(session.user.hospitalId);
    const date = todayDateString();
    const { rows: tokenRows } = await sql`
      SELECT t.id, t.status FROM tokens t
      JOIN doctors d ON d.id = t.doctor_id
      WHERE t.id = ${tokenId} AND t.doctor_id = ${doctorId} AND d.hospital_id = ${hospitalId} AND t.date = ${date}
      LIMIT 1
    `;
    if (!tokenRows.length) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }
    const status = (tokenRows[0] as { status?: string }).status as string;
    if (status !== "waiting" && status !== "current") {
      return NextResponse.json(
        { error: "Only waiting or current tokens can be cancelled" },
        { status: 400 }
      );
    }
    await sql`
      UPDATE tokens SET status = 'cancelled'
      WHERE id = ${tokenId} AND doctor_id = ${doctorId} AND date = ${date}
    `;
    const { rows } = await sql`
      SELECT t.id, t.date, t.patient_unique_code, t.patient_name, t.token_number, t.status, t.started_at, t.ended_at, t.created_at
      FROM tokens t
      JOIN doctors d ON d.id = t.doctor_id
      WHERE d.id = ${doctorId} AND d.hospital_id = ${hospitalId} AND t.date = ${date}
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
