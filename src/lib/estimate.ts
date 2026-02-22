import { sql } from "@/lib/db";

const DEFAULT_AVG_MINUTES = 10;

/**
 * Get average consultation duration in minutes for a doctor (from recent completed tokens).
 */
export async function getAvgConsultationMinutes(doctorId: number): Promise<number> {
  const { rows } = await sql`
    SELECT started_at, ended_at FROM tokens
    WHERE doctor_id = ${doctorId} AND status = 'done' AND started_at IS NOT NULL AND ended_at IS NOT NULL
    ORDER BY ended_at DESC LIMIT 20
  `;
  if (rows.length === 0) return DEFAULT_AVG_MINUTES;
  let totalMs = 0;
  let count = 0;
  for (const r of rows) {
    const start = r.started_at ? new Date(r.started_at).getTime() : 0;
    const end = r.ended_at ? new Date(r.ended_at).getTime() : 0;
    if (end > start) {
      totalMs += end - start;
      count++;
    }
  }
  if (count === 0) return DEFAULT_AVG_MINUTES;
  return Math.round(totalMs / count / 60_000) || DEFAULT_AVG_MINUTES;
}

/**
 * positionInQueue = 1-based (1 = next to be called). Minutes from now = (position - 1) * avg.
 */
export function estimateVisitTime(
  positionInQueue: number,
  avgMinutes: number
): { estimatedAt: Date; minutesFromNow: number } {
  const minutesFromNow = Math.max(0, (positionInQueue - 1)) * avgMinutes;
  const estimatedAt = new Date(Date.now() + minutesFromNow * 60_000);
  return { estimatedAt, minutesFromNow };
}

/**
 * Format time in IST (India Standard Time).
 */
export function formatIST(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
