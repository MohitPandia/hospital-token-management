"use client";

import { useParams } from "next/navigation";
import { BackLink, LoadingState } from "@/components/ui";
import {
  QueueActions,
  CurrentTokenCard,
  TokenList,
  AddTokenForm,
} from "@/components/dashboard";
import { useDoctorQueue } from "@/hooks";

export default function DoctorQueuePage() {
  const params = useParams();
  const id = (params.id as string) ?? null;
  const {
    tokens,
    doctor,
    loading,
    refetch,
    refetchSilent,
    callNext,
    markDone,
    cancelToken,
  } = useDoctorQueue(id);

  const currentToken = tokens.find((t) => t.status === "current");

  if (loading) {
    return <LoadingState message="Loading queue…" />;
  }

  return (
    <div>
      <div className="mb-4">
        <BackLink href="/dashboard">← Doctors</BackLink>
      </div>
      <h1 className="text-xl font-bold text-teal-900 mb-1">
        {doctor?.name ?? "Queue"}
      </h1>
      <p className="text-teal-600 text-sm mb-6">Today’s tokens</p>

      <QueueActions onCallNext={callNext} onMarkDone={markDone} />

      {currentToken && <CurrentTokenCard token={currentToken} />}

      <TokenList tokens={tokens} onCancel={cancelToken} />

      <AddTokenForm doctorId={id} onAdded={refetchSilent} />
    </div>
  );
}
