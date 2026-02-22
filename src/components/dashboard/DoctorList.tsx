import Link from "next/link";
import type { Doctor } from "@/types/domain";
import { Card } from "@/components/ui";

interface DoctorListProps {
  doctors: Doctor[];
  emptyMessage?: string;
}

export function DoctorList({
  doctors,
  emptyMessage = "No doctors yet. Add your first doctor below.",
}: DoctorListProps) {
  if (doctors.length === 0) {
    return (
      <li>
        <Card className="p-6 text-center text-teal-600">{emptyMessage}</Card>
      </li>
    );
  }

  return (
    <>
      {doctors.map((d) => (
        <li key={d.id}>
          <Link
            href={`/dashboard/doctors/${d.id}`}
            className="card p-4 flex items-center justify-between gap-4 active:bg-teal-50/50 transition"
          >
            <span className="font-semibold text-teal-900">{d.name}</span>
            <span className="text-teal-500 text-sm shrink-0">Open queue →</span>
          </Link>
        </li>
      ))}
    </>
  );
}
