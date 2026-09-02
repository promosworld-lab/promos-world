"use client";

import {
  ReactNode,
  useEffect,
} from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          {title && (
            <h2 className="text-lg font-bold text-white">
              {title}
            </h2>
          )}

          <button
            onClick={onClose}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-xl text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}