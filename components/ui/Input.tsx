"use client";

import {
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-white">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}

        <input
          className={`
            min-h-[48px]
            w-full
            rounded-xl
            border
            border-white/10
            bg-zinc-900
            px-4
            text-white
            outline-none
            transition
            placeholder:text-zinc-500
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500/20
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}