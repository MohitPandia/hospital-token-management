/**
 * Domain types used across the app (API responses, UI state).
 */

export type TokenStatus = "waiting" | "current" | "done" | "cancelled";

export interface Doctor {
  id: number;
  name: string;
  contact: string | null;
  created_at?: string;
}

export interface Token {
  id: number;
  doctor_id?: number;
  date?: string;
  patient_unique_code: string;
  patient_name: string | null;
  token_number: number;
  status: TokenStatus | string;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string;
}

export interface AddTokenResponse {
  patientUniqueCode: string;
  tokenNumber: number;
  patientName: string | null;
}

export interface PatientLookupResult {
  tokenNumber: number;
  patientName: string | null;
  doctorName: string;
  hospitalName: string;
  status: string;
  positionInQueue: number | null;
  estimatedIST: string | null;
  minutesFromNow: number | null;
  message?: string;
  date?: string;
}

export const TOKEN_STATUS_LABELS: Record<string, string> = {
  current: "Now",
  waiting: "Waiting",
  done: "Done",
  cancelled: "Cancelled",
} as const;

export function getTokenStatusLabel(status: string): string {
  return TOKEN_STATUS_LABELS[status] ?? "Done";
}
