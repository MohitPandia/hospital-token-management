import { Card } from "@/components/ui";
import type { PatientLookupResult } from "@/types/domain";

function formatTokenDate(dateValue: string): string {
  const dateOnly = dateValue.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return dateValue;
  try {
    const d = new Date(dateOnly + "T12:00:00");
    if (Number.isNaN(d.getTime())) return dateValue;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateValue;
  }
}

interface PatientResultCardProps {
  result: PatientLookupResult;
}

export function PatientResultCard({ result }: PatientResultCardProps) {
  const showEstimate =
    result.positionInQueue != null &&
    result.positionInQueue > 0 &&
    result.estimatedIST;
  const isForToday = !result.message;

  return (
    <Card className="p-6 space-y-4">
      <div className="text-center pb-4 border-b border-teal-100">
        <p className="text-sm text-teal-600 mb-1">Your token</p>
        <p className="text-4xl font-bold text-teal-900">#{result.tokenNumber}</p>
      </div>
      <div className="space-y-3">
        {result.date && (
          <p className="text-teal-700">
            <span className="text-teal-500 text-sm">Token date</span>
            <br />
            <span className="font-medium">{formatTokenDate(result.date)}</span>
          </p>
        )}
        {result.hospitalName && (
          <p className="text-teal-700">
            <span className="text-teal-500 text-sm">Hospital</span>
            <br />
            <span className="font-medium">{result.hospitalName}</span>
          </p>
        )}
        {result.doctorName && (
          <p className="text-teal-700">
            <span className="text-teal-500 text-sm">Doctor</span>
            <br />
            <span className="font-medium">{result.doctorName}</span>
          </p>
        )}
        {result.message && (
          <p className="text-amber-700 text-sm">{result.message}</p>
        )}
        {isForToday && result.positionInQueue != null && result.positionInQueue > 0 && (
          <p className="text-teal-700">
            <span className="text-teal-500 text-sm">Position in queue</span>
            <br />
            <span className="font-bold text-teal-900">
              {result.positionInQueue}{" "}
              {result.positionInQueue === 1
                ? "— you're next"
                : "ahead of you"}
            </span>
          </p>
        )}
        {showEstimate && (
          <div className="rounded-xl bg-teal-100 p-4 border border-teal-200">
            <p className="text-sm text-teal-600 mb-1">
              Estimated time to visit (IST)
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {result.estimatedIST}
            </p>
            {result.minutesFromNow != null && result.minutesFromNow > 0 && (
              <p className="text-teal-700 text-sm mt-1">
                approx. {result.minutesFromNow} min from now
              </p>
            )}
            {result.minutesFromNow === 0 && (
              <p className="text-teal-700 text-sm mt-1">You can visit now.</p>
            )}
            <p className="text-teal-500 text-xs mt-2">
              Based on your position and average consultation time.
            </p>
          </div>
        )}
        {isForToday && result.status === "current" && (
          <p className="font-medium text-teal-800">
            You’re currently with the doctor.
          </p>
        )}
        {isForToday && result.status === "done" && (
          <p className="text-teal-600">This token is done.</p>
        )}
        {isForToday && result.status === "cancelled" && (
          <p className="text-amber-700">This token has been cancelled.</p>
        )}
      </div>
    </Card>
  );
}
