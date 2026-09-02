"use client";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "Aucune donnée",
  message,
  description,
  action,
}: EmptyStateProps) {
  const content = message || description;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
      <div className="mb-4 text-5xl">📭</div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      {content && (
        <p className="mt-2 max-w-md text-sm text-gray-400">
          {content}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;