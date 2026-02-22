"use client";

import { useState } from "react";
import { Card, Input, Button, SubmitButton } from "@/components/ui";
import { createDoctor } from "@/lib/api";
import type { Doctor } from "@/types/domain";

interface AddDoctorFormProps {
  readonly onSuccess: (doctor: Doctor) => void;
  readonly onCancel: () => void;
}

export function AddDoctorForm({ onSuccess, onCancel }: AddDoctorFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setAdding(true);
    try {
      const doctor = await createDoctor({
        name: name.trim(),
        contact: contact.trim() || undefined,
      });
      setName("");
      setContact("");
      onSuccess(doctor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add doctor");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-teal-900">Add doctor</h2>
        <Input
          id="add-doctor-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. S. Pandya"
          required
          autoFocus
        />
        <Input
          id="add-doctor-contact"
          label="Contact (optional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone or email"
        />
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 border-teal-200"
          >
            Cancel
          </Button>
          <SubmitButton
            variant="primary"
            loading={adding}
            className="flex-1"
          >
            {adding ? "Adding…" : "Add"}
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}
