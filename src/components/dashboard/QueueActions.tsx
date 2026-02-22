import { Button } from "@/components/ui";

interface QueueActionsProps {
  onCallNext: () => void;
  onMarkDone: () => void;
}

export function QueueActions({ onCallNext, onMarkDone }: QueueActionsProps) {
  return (
    <div className="flex gap-3 mb-6">
      <Button
        variant="primary"
        onClick={onCallNext}
        className="flex-1 py-4 text-lg"
      >
        Call next
      </Button>
      <Button
        variant="secondary"
        onClick={onMarkDone}
        className="flex-1 py-4 text-lg"
      >
        Mark done
      </Button>
    </div>
  );
}
