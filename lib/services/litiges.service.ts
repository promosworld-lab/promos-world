import { supabase } from "@/lib/supabase";

export const litigesService = {
  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from("litiges")
      .select(`
        *,
        transaction:transactions (
          montant_total,
          statut
        ),
        promotion:promotions (
          titre
        )
      `)
      .eq("client_id", clientId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("litiges")
      .select(`
        *,
        client:profiles!litiges_client_id_fkey (
          nom,
          telephone
        ),
        transaction:transactions (
          montant_total,
          statut
        ),
        promotion:promotions (
          titre
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async create(payload: {
    transaction_id: string;
    client_id: string;
    promotion_id?: string | null;
    motif: string;
  }) {
    const { data, error } = await supabase
      .from("litiges")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateStatus(
    id: string,
    statut: "ouvert" | "en_cours" | "resolu" | "rejete",
    decision_admin?: string
  ) {
    const { data, error } = await supabase
      .from("litiges")
      .update({
        statut,
        decision_admin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};