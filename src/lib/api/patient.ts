import type { PatientLookupResult } from "@/types/domain";

export async function lookupPatientByCode(code: string): Promise<PatientLookupResult> {
  const trimmed = code.trim().toUpperCase();
  const res = await fetch(
    `/api/patient?code=${encodeURIComponent(trimmed)}`
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Lookup failed");
  }
  return data as PatientLookupResult;
}
