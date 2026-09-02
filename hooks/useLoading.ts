"use client";

import { useState } from "react";

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  const withLoading = async <T,>(
    callback: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(true);

      return await callback();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
}