import { supabase } from "@/lib/supabase";

export const promotionsService = {
  async getAll() {
    const { data, error } = await supabase
      .from("promotions")
      .select(`
        *,
        vendeur:profiles!promotions_vendeur_id_fkey (
          id,
          nom,
          telephone
        )
      `)
      .eq("statut", "actif")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("promotions")
      .select(`
        *,
        vendeur:profiles!promotions_vendeur_id_fkey (
          id,
          nom,
          telephone,
          ville,
          pays
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async getByVendeur(vendeurId: string) {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("vendeur_id", vendeurId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async create(payload: Record<string, any>) {
    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async update(id: string, payload: Record<string, any>) {
    const { data, error } = await supabase
      .from("promotions")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};