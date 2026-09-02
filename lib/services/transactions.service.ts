import { supabase } from "@/lib/supabase";

export const transactionsService = {
  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        promotion:promotions (
          titre,
          photo_url
        )
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
      .from("transactions")
      .select(`
        *,
        promotion:promotions (
          titre,
          photo_url
        ),
        client:profiles!transactions_client_id_fkey (
          nom,
          telephone
        )
      `)
      .eq("vendeur_id", vendeurId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async create(payload: Record<string, any>) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateStatus(id: string, statut: string) {
    const { data, error } = await supabase
      .from("transactions")
      .update({ statut })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};