"use client";

import { useCallback, useEffect, useState } from "react";
import { promotionService } from "@/services/promotion.service";
import type { Promotion } from "@/types";

export function usePromotions() {
  const [promotions,setPromotions]=useState<Promotion[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const loadPromotions=useCallback(async()=>{
    setLoading(true);setError(null);
    try { setPromotions(await promotionService.getActivePromotions()); }
    catch(err){ setError(err instanceof Error ? err.message : "Impossible de charger les publications."); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{loadPromotions();},[loadPromotions]);
  return {promotions,loading,error,refresh:loadPromotions};
}