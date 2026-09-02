"use client";

interface ErrorStateProps {
  title?: string;
  message?: string;
  description?: string;
  retry?: () => void;
}

export function ErrorState({
  title = "Une erreur est survenue",
  message,
  description,
  retry,
}: ErrorStateProps) {
  const content =
    message ||
    description ||
    "Impossible de charger les informations demandées.";

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
      <div className="mb-4 text-5xl">⚠️</div>

      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm text-gray-400">
        {content}
      </p>

      {retry && (
        <button
          onClick={retry}
          className="mt-6 rounded-xl bg-orange-500 px-5 py-3 font-medium text-black transition hover:bg-orange-400"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

export default ErrorState;