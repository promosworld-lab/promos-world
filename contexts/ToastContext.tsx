"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

export type ToastType =
  | "success"
  | "error"
  | "info"
  | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType
  ) => void;
}

const ToastContext = createContext<
  ToastContextType | undefined
>(undefined);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info"
  ) => {
    const id = crypto.randomUUID();

    setToasts((previous) => [
      ...previous,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((previous) =>
        previous.filter(
          (toast) => toast.id !== id
        )
      );
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}