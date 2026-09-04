"use client";

import { useCallback, useEffect, useState } from "react";
import { promotionsService } from "@/lib/services/promotions.service";
import type { Promotion } from "@/lib/types";

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promotionsService.getAll();
      setPromotions((data ?? []) as Promotion[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les publications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPromotions(); }, [loadPromotions]);
  return { promotions, loading, error, refresh: loadPromotions };
}
