"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}