import { useState, useEffect, useCallback } from "react";
import { fetchDoctors } from "@/lib/api/doctors";
import {
  fetchTokens,
  callNext as apiCallNext,
  markDone as apiMarkDone,
  cancelToken as apiCancelToken,
} from "@/lib/api/tokens";
import type { Doctor } from "@/types/domain";
import type { Token } from "@/types/domain";

export function useDoctorQueue(doctorId: string | null) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const [tokenList, doctorList] = await Promise.all([
        fetchTokens(doctorId),
        fetchDoctors(),
      ]);
      setTokens(tokenList);
      const doc = doctorList.find((d) => d.id === Number(doctorId)) ?? null;
      setDoctor(doc);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  /** Refetch tokens/doctor without showing full-page loading (keeps form state visible). */
  const refetchSilent = useCallback(async () => {
    if (!doctorId) return;
    try {
      const [tokenList, doctorList] = await Promise.all([
        fetchTokens(doctorId),
        fetchDoctors(),
      ]);
      setTokens(tokenList);
      const doc = doctorList.find((d) => d.id === Number(doctorId)) ?? null;
      setDoctor(doc);
    } catch {
      // ignore
    }
  }, [doctorId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const callNext = useCallback(async () => {
    if (!doctorId) return;
    const updated = await apiCallNext(doctorId);
    setTokens(updated);
  }, [doctorId]);

  const markDone = useCallback(async () => {
    if (!doctorId) return;
    const updated = await apiMarkDone(doctorId);
    setTokens(updated);
  }, [doctorId]);

  const cancelToken = useCallback(
    async (tokenId: number) => {
      if (!doctorId) return;
      const updated = await apiCancelToken(doctorId, tokenId);
      setTokens(updated);
    },
    [doctorId]
  );

  return {
    tokens,
    doctor,
    loading,
    refetch,
    refetchSilent,
    callNext,
    markDone,
    cancelToken,
  };
}
