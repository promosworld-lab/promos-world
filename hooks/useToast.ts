"use client";

import { useToastContext } from "@/components/providers/ToastProvider";

export function useToast() {
  return useToastContext();
}