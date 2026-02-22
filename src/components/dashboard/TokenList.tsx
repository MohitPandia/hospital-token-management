import { useState } from "react";
import type { Token } from "@/types/domain";
import { getTokenStatusLabel } from "@/types/domain";
import { Card } from "@/components/ui";

interface TokenListProps {
  tokens: Token[];
  onCancel?: (tokenId: number) => Promise<void>;
}

export function TokenList({ tokens, onCancel }: TokenListProps) {
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const waitingCount = tokens.filter((t) => t.status === "waiting").length;
  const canCancel = (t: Token) =>
    t.status === "waiting" || t.status === "current";

  const handleCancel = async (tokenId: number) => {
    if (!onCancel) return;
    setCancellingId(tokenId);
    try {
      await onCancel(tokenId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel token");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-4 py-3 border-b border-teal-100 bg-teal-50/50">
        <span className="font-medium text-teal-800">
          Queue ({tokens.length}) · {waitingCount} waiting
        </span>
      </div>
      <ul className="divide-y divide-teal-100">
        {tokens.length === 0 ? (
          <li className="p-6 text-center text-teal-600">No tokens yet.</li>
        ) : (
          tokens.map((t) => (
            <li
              key={t.id}
              className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 gap-y-2 ${
                t.status === "current" ? "bg-teal-50" : ""
              } ${t.status === "done" ? "opacity-60" : ""} ${
                t.status === "cancelled" ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-wrap min-w-0">
                <span className="font-semibold text-teal-900 shrink-0">
                  #{t.token_number}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(t.patient_unique_code)}
                  className="font-mono text-sm text-teal-700 hover:text-teal-900 hover:bg-teal-100 rounded px-2 py-1 -mx-1 transition-colors text-left"
                  title="Click to copy token ID"
                >
                  {t.patient_unique_code}
                </button>
                {copiedCode === t.patient_unique_code && (
                  <span className="text-xs text-teal-600">Copied!</span>
                )}
                {t.patient_name && (
                  <span className="text-teal-600 text-sm">{t.patient_name}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm text-teal-500">
                  {getTokenStatusLabel(t.status)}
                </span>
                {onCancel && canCancel(t) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(t.id)}
                    disabled={cancellingId !== null}
                    className="text-sm text-amber-700 hover:text-amber-800 font-medium disabled:opacity-50"
                  >
                    {cancellingId === t.id ? "Cancelling…" : "Cancel"}
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </Card>
  );
}
