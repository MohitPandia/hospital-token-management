interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12 text-teal-600">
      {message}
    </div>
  );
}
