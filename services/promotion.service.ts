import { supabase } from "@/lib/supabase/client";
import type { Promotion } from "@/types";

export const promotionService = {
  async getActivePromotions() {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("statut", "actif")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Promotion[];
  },

  async getPromotionById(id: string) {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data as Promotion;
  },

  async getPromotionsBySeller(vendeurId: string) {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("vendeur_id", vendeurId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Promotion[];
  },
};