import { supabase } from "@/lib/supabase/client";
import type { Promotion } from "@/types/database";

export type PromotionInput = Omit<Partial<Promotion>, "id" | "vendeur_id" | "created_at" | "updated_at"> & { titre: string; categorie: string; prix_original: number; prix_promo: number; stock: number };

export const promotionsService = {
  async getAll(): Promise<Promotion[]> {
    const { data, error } = await supabase.from("promotions").select("*").eq("statut", "actif").eq("is_active", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Promotion[];
  },
  async getById(id: string): Promise<Promotion | null> {
    const { data, error } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Promotion | null;
  },
  async getByVendeur(vendeurId: string): Promise<Promotion[]> {
    const { data, error } = await supabase.from("promotions").select("*").eq("vendeur_id", vendeurId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Promotion[];
  },
  async create(payload: PromotionInput): Promise<Promotion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié.");
    const { data, error } = await supabase.from("promotions").insert({ ...payload, vendeur_id: user.id }).select().single();
    if (error) throw error;
    return data as Promotion;
  },
  async update(id: string, payload: Partial<PromotionInput>): Promise<Promotion> {
    const { data, error } = await supabase.from("promotions").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return data as Promotion;
  },
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("promotions").delete().eq("id", id);
    if (error) throw error;
  },
};