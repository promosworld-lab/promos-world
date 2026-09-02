"use client";

import {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-orange-500 text-black hover:bg-orange-400",

    secondary:
      "border border-white/20 bg-white/10 text-white hover:bg-white/15",

    danger:
      "bg-red-500 text-white hover:bg-red-400",

    ghost:
      "text-white hover:bg-white/10",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex min-h-[44px] items-center justify-center
        rounded-xl px-5 py-3
        font-semibold
        transition-all duration-200
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
}