interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  text = "Chargement...",
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen" : "py-10"
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

      {text && (
        <span className="text-sm text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}

export default Loading;