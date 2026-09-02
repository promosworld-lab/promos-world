import { supabase } from "@/lib/supabase/client";

export const avisService = {
  async getByVendeur(vendeurId: string) {
    const { data, error } = await supabase
      .from("avis")
      .select(`
        *,
        client:profiles!avis_client_id_fkey (
          id,
          nom,
          email
        )
      `)
      .eq("vendeur_id", vendeurId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("avis")
      .select(`
        *,
        vendeur:profiles!avis_vendeur_id_fkey (
          id,
          nom,
          email
        )
      `)
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  },

  async create(payload: {
    client_id: string;
    vendeur_id: string;
    reservation_id: string;
    note: number;
    commentaire?: string;
  }) {
    const { data, error } = await supabase
      .from("avis")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async getAverage(vendeurId: string) {
    const { data, error } = await supabase
      .from("avis")
      .select("note")
      .eq("vendeur_id", vendeurId);

    if (error) throw error;

    const avis = data || [];

    if (avis.length === 0) {
      return {
        average: 0,
        count: 0,
      };
    }

    const total = avis.reduce(
      (sum, avis) => sum + Number(avis.note),
      0
    );

    return {
      average: total / avis.length,
      count: avis.length,
    };
  },
};