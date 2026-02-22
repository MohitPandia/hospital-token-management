"use client";

import { BackLink, PageHeader } from "@/components/ui";
import { PatientLookupForm, PatientResultCard } from "@/components/patient";
import { usePatientLookup } from "@/hooks";

export default function PatientPage() {
  const { result, lookup } = usePatientLookup();

  return (
    <main className="min-h-screen flex flex-col p-6 pb-[max(1.5rem,var(--safe-bottom))] max-w-lg mx-auto">
      <div className="mb-8">
        <BackLink href="/">← Back</BackLink>
      </div>
      <PageHeader
        title="Check my token"
        description="Enter the code you received when your token was issued."
      />
      <PatientLookupForm onSubmit={lookup} />
      {result && <PatientResultCard result={result} />}
    </main>
  );
}
