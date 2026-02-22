"use client";

import { useState } from "react";
import { PageHeader, Button, LoadingState } from "@/components/ui";
import { DoctorList, AddDoctorForm } from "@/components/dashboard";
import { useDoctors } from "@/hooks";
import type { Doctor } from "@/types/domain";

export default function DashboardPage() {
  const { doctors, loading, refetch } = useDoctors();
  const [showAdd, setShowAdd] = useState(false);

  const handleAddSuccess = (doctor: Doctor) => {
    setShowAdd(false);
    refetch();
  };

  if (loading) {
    return <LoadingState message="Loading doctors…" />;
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Tap a doctor to manage today's token queue."
      />
      <ul className="space-y-3 mb-8">
        <DoctorList
          doctors={doctors}
          emptyMessage="No doctors yet. Add your first doctor below."
        />
      </ul>
      {showAdd ? (
        <AddDoctorForm onSuccess={handleAddSuccess} onCancel={() => setShowAdd(false)} />
      ) : (
        <Button
          variant="secondary"
          fullWidth
          onClick={() => setShowAdd(true)}
          className="py-4 text-lg"
        >
          + Add doctor
        </Button>
      )}
    </div>
  );
}
