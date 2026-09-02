export default function ErrorState({
  title = 'Une erreur est survenue',
  message = 'Impossible de charger ces informations.',
  onRetry,
}) {
  return (
    <div className="pw-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 text-5xl">
        ⚠️
      </div>

      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-zinc-400">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="pw-btn-primary mt-6"
        >
          Réessayer
        </button>
      )}
    </div>
  )
}