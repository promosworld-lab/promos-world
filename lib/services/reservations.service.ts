import { supabase } from "@/lib/supabase";

export const reservationsService = {
  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        promotion:promotions (*)
      `)
      .eq("client_id", clientId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async getByVendeur(vendeurId: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        promotion:promotions!inner (*)
      `)
      .eq("promotions.vendeur_id", vendeurId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        promotion:promotions (
          *,
          vendeur:profiles!promotions_vendeur_id_fkey (*)
        ),
        client:profiles!reservations_client_id_fkey (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async create(payload: Record<string, any>) {
    const { data, error } = await supabase
      .from("reservations")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateStatus(id: string, statut: string) {
    const { data, error } = await supabase
      .from("reservations")
      .update({ statut })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async update(id: string, payload: Record<string, any>) {
    const { data, error } = await supabase
      .from("reservations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};