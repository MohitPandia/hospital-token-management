import type { Doctor } from "@/types/domain";

const API = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const res = await fetch(`${API}/doctors`);
  return handleResponse<Doctor[]>(res);
}

export async function createDoctor(params: {
  name: string;
  contact?: string;
}): Promise<Doctor> {
  const res = await fetch(`${API}/doctors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<Doctor>(res);
}
