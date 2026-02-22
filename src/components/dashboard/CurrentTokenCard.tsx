import { Card } from "@/components/ui";
import type { Token } from "@/types/domain";

interface CurrentTokenCardProps {
  token: Token;
}

export function CurrentTokenCard({ token }: CurrentTokenCardProps) {
  return (
    <Card className="p-4 mb-4 bg-teal-50 border-teal-200">
      <p className="text-sm text-teal-600 mb-1">Now with doctor</p>
      <p className="text-2xl font-bold text-teal-900">
        Token #{token.token_number}
      </p>
      {token.patient_name && (
        <p className="text-teal-700">{token.patient_name}</p>
      )}
    </Card>
  );
}
