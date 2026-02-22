"use client";

import { useState } from "react";
import { Card, Input, SubmitButton } from "@/components/ui";

interface PatientLookupFormProps {
  onSubmit: (code: string) => Promise<void>;
}

export function PatientLookupForm({ onSubmit }: PatientLookupFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-4 mb-6">
        <Input
          id="patient-code"
          label="Your code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. AB12CD34EF"
          error={error}
          className="font-mono text-lg tracking-wider uppercase"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
        />
        <SubmitButton
          variant="primary"
          fullWidth
          loading={loading}
          className="py-4 text-lg"
        >
          {loading ? "Checking…" : "Check"}
        </SubmitButton>
      </Card>
    </form>
  );
}
