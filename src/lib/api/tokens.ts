import type { Token } from "@/types/domain";
import type { AddTokenResponse } from "@/types/domain";

const API = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export async function fetchTokens(doctorId: string): Promise<Token[]> {
  const res = await fetch(`${API}/doctors/${doctorId}/tokens`);
  return handleResponse<Token[]>(res);
}

export async function addToken(
  doctorId: string,
  params: { patientName?: string; date?: string }
): Promise<AddTokenResponse> {
  const res = await fetch(`${API}/doctors/${doctorId}/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<AddTokenResponse>(res);
}

export async function callNext(doctorId: string): Promise<Token[]> {
  const res = await fetch(`${API}/doctors/${doctorId}/tokens/call-next`, {
    method: "POST",
  });
  return handleResponse<Token[]>(res);
}

export async function markDone(doctorId: string): Promise<Token[]> {
  const res = await fetch(`${API}/doctors/${doctorId}/tokens/mark-done`, {
    method: "POST",
  });
  return handleResponse<Token[]>(res);
}

export async function cancelToken(
  doctorId: string,
  tokenId: number
): Promise<Token[]> {
  const res = await fetch(`${API}/doctors/${doctorId}/tokens/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokenId }),
  });
  return handleResponse<Token[]>(res);
}
