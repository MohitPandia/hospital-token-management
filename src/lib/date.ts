/**
 * Date helpers (server and client safe).
 * Uses Asia/Kolkata (IST) so "today" matches the hospital calendar in India.
 */

export function todayDateString(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Normalize a date from DB (Date or string) to YYYY-MM-DD for API responses.
 * The driver often returns DATE as midnight in server TZ (e.g. IST), which
 * serializes to the previous day in UTC; this keeps the calendar day correct.
 */
export function normalizeDateForResponse(val: unknown): string {
  if (val instanceof Date) {
    return val.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  }
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    }
    return val.slice(0, 10);
  }
  return String(val).slice(0, 10);
}
