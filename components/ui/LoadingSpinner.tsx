interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export function LoadingSpinner({
  size = "md",
  text,
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-orange-500 border-t-transparent`}
      />

      {text && (
        <span className="text-sm text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}

export default LoadingSpinner;