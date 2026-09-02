"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: ToastType
  ) => {
    const id = Date.now();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((current) =>
        current.filter((toast) => toast.id !== id)
      );
    }, 4000);
  };

  const value = {
    success: (message: string) =>
      showToast(message, "success"),

    error: (message: string) =>
      showToast(message, "error"),

    info: (message: string) =>
      showToast(message, "info"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              animate-in slide-in-from-right rounded-xl border px-4 py-4 shadow-2xl backdrop-blur
              ${
                toast.type === "success"
                  ? "border-green-500/40 bg-green-500/15 text-green-300"
                  : ""
              }
              ${
                toast.type === "error"
                  ? "border-red-500/40 bg-red-500/15 text-red-300"
                  : ""
              }
              ${
                toast.type === "info"
                  ? "border-orange-500/40 bg-orange-500/15 text-orange-300"
                  : ""
              }
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast doit être utilisé dans ToastProvider"
    );
  }

  return context;
}