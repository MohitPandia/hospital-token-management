import { NextResponse } from "next/server";
import { todayDateString } from "@/lib/date";

export async function GET() {
  return NextResponse.json({ date: todayDateString() });
}
