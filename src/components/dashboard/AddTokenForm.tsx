"use client";

import { useState, useEffect } from "react";
import { Card, Input, SubmitButton } from "@/components/ui";
import { addToken } from "@/lib/api";

function getTodayIST(): string {
  const d = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

interface AddTokenFormProps {
  doctorId: string;
  onAdded: () => void;
}

export function AddTokenForm({ doctorId, onAdded }: AddTokenFormProps) {
  const [patientName, setPatientName] = useState("");
  const [tokenDate, setTokenDate] = useState(getTodayIST);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/today")
      .then((r) => r.json())
      .then((data: { date?: string }) => {
        if (!cancelled && typeof data.date === "string" && data.date.length >= 10) {
          setTokenDate(data.date.slice(0, 10));
        }
      })
      .catch(() => {
        if (!cancelled) setTokenDate(getTodayIST());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addToken(doctorId, {
        patientName: patientName.trim() || undefined,
        date: tokenDate || undefined,
      });
      setPatientName("");
      onAdded();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add token");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-teal-900">Add token</h2>
        <div>
          <label
            htmlFor="queue-token-date"
            className="block text-sm font-medium text-teal-700 mb-1"
          >
            Date
          </label>
          <input
            id="queue-token-date"
            type="date"
            value={tokenDate}
            onChange={(e) => setTokenDate(e.target.value)}
            className="w-full rounded-lg border border-teal-200 px-3 py-2 text-teal-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <Input
          id="queue-patient-name"
          label="Patient name (optional)"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="e.g. Raj Kumar"
        />
        <SubmitButton
          variant="primary"
          fullWidth
          loading={adding}
          className="py-4 text-lg"
        >
          {adding ? "Adding…" : "Add token"}
        </SubmitButton>
      </Card>
    </form>
  );
}
