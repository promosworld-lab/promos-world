import { supabase } from "@/lib/supabase/client";
import type { Avis } from "@/types/database";

type PromotionSellerRelation =
  | { vendeur_id: string }
  | { vendeur_id: string }[]
  | null;

export const avisService = {
  async getByVendeur(vendeurId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from("avis")
      .select("*")
      .eq("vendeur_id", vendeurId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Avis[];
  },

  async getByUser(userId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from("avis")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Avis[];
  },

  async create(
    reservationId: string,
    note: number,
    commentaire?: string,
  ): Promise<Avis> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Utilisateur non authentifié.");
    if (note < 1 || note > 5) {
      throw new Error("La note doit être comprise entre 1 et 5.");
    }

    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .select(
        "id,client_id,promotion_id,statut,promotions(vendeur_id)",
      )
      .eq("id", reservationId)
      .eq("client_id", user.id)
      .single();

    if (reservationError) throw reservationError;
    if (reservation.statut !== "terminee") {
      throw new Error(
        "Un avis est possible uniquement après une transaction terminée.",
      );
    }

    const promotionRelation =
      reservation.promotions as PromotionSellerRelation;
    const vendeurId = Array.isArray(promotionRelation)
      ? promotionRelation[0]?.vendeur_id
      : promotionRelation?.vendeur_id;

    if (!vendeurId) throw new Error("Vendeur introuvable.");

    const { data, error } = await supabase
      .from("avis")
      .insert({
        client_id: user.id,
        vendeur_id: vendeurId,
        reservation_id: reservationId,
        note,
        commentaire: commentaire?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Avis;
  },

  async getAverage(vendeurId: string) {
    const { data, error } = await supabase
      .from("avis")
      .select("note")
      .eq("vendeur_id", vendeurId);

    if (error) throw error;
    const rows = data ?? [];

    return {
      average: rows.length
        ? rows.reduce((sum, row) => sum + Number(row.note), 0) / rows.length
        : 0,
      count: rows.length,
    };
  },
};
