import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border border-white/10
        bg-zinc-900
        p-4
        shadow-lg
        transition-all
        duration-200
        ${onClick ? "cursor-pointer hover:border-orange-500/40 hover:bg-zinc-800" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}