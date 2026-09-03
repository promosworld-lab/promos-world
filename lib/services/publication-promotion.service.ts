import { supabase } from "@/lib/supabase/client";
import type { PublicationPromotion } from "@/lib/types";

export const publicationPromotionService = {
  async getActiveForPublication(publicationId: string) {
    const { data, error } = await supabase
      .from("publication_promotions")
      .select("*")
      .eq("publication_id", publicationId)
      .eq("statut", "active")
      .lte("date_debut", new Date().toISOString())
      .gte("date_fin", new Date().toISOString())
      .maybeSingle();
    if (error) throw error;
    return data as PublicationPromotion | null;
  },

  async getActiveForPlacement(emplacement: PublicationPromotion["emplacement"]) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("publication_promotions")
      .select("*, publication:promotions(*)")
      .eq("statut", "active")
      .eq("emplacement", emplacement)
      .lte("date_debut", now)
      .gte("date_fin", now)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getByVendeur(vendeurId: string) {
    const { data, error } = await supabase
      .from("publication_promotions")
      .select("*, publication:promotions(*)")
      .eq("vendeur_id", vendeurId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async request(payload: Pick<PublicationPromotion, "publication_id" | "vendeur_id" | "emplacement" | "date_debut" | "date_fin">) {
    const { data, error } = await supabase
      .from("publication_promotions")
      .insert({ ...payload, statut: "en_attente" })
      .select()
      .single();
    if (error) throw error;
    return data as PublicationPromotion;
  },
};
