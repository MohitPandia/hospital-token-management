import { useState, useCallback } from "react";
import { lookupPatientByCode } from "@/lib/api";
import type { PatientLookupResult } from "@/types/domain";

export function usePatientLookup() {
  const [result, setResult] = useState<PatientLookupResult | null>(null);

  const lookup = useCallback(async (code: string) => {
    setResult(null);
    const data = await lookupPatientByCode(code);
    setResult(data);
  }, []);

  return { result, lookup };
}
