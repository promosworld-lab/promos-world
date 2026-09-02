interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Loading({
  text = "Chargement...",
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center gap-4
        ${fullScreen ? "min-h-screen" : "py-10"}
      `}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

      <p className="text-sm text-zinc-400">
        {text}
      </p>
    </div>
  );
}