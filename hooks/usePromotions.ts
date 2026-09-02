"use client";

import { useEffect, useState } from "react";
import { promotionService } from "@/services/promotion.service";
import type { Promotion } from "@/types";

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      setLoading(true);
      setError(null);

      const data =
        await promotionService.getActivePromotions();

      setPromotions(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return {
    promotions,
    loading,
    error,
    refresh: loadPromotions,
  };
}