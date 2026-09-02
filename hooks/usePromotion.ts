"use client";

import { useCallback, useEffect, useState } from "react";
import { promotionsService } from "@/lib/services/promotions.service";

export function usePromotion(id?: string) {
  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotion = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await promotionsService.getById(id);

      setPromotion(data);
    } catch (err: any) {
      console.error("Erreur récupération promotion:", err);

      setError(
        err?.message ||
          "Impossible de récupérer cette promotion."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPromotion();
  }, [fetchPromotion]);

  return {
    promotion,
    loading,
    error,
    refetch: fetchPromotion,
  };
}

export default usePromotion;