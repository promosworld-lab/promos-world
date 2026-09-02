"use client";

import React from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Aucune donnée",
  message,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  const content = message || description;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 text-5xl">
        {icon || "📭"}
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      {content && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">
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