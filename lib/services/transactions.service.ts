import { supabase } from "@/lib/supabase/client";
import type { Transaction } from "@/types/database";

export const transactionsService = {
  async getByClient(clientId: string): Promise<Transaction[]> {
    const { data, error } = await supabase.from("transactions").select("*, promotion:promotions(titre,photo_url)").eq("client_id", clientId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Transaction[];
  },
  async getByVendeur(vendeurId: string): Promise<Transaction[]> {
    const { data, error } = await supabase.from("transactions").select("*, promotion:promotions(titre,photo_url), client:profiles!transactions_client_id_fkey(nom,telephone)").eq("vendeur_id", vendeurId).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Transaction[];
  },
  async createDirectPurchase(promotionId: string): Promise<string> {
    const { data, error } = await supabase.rpc("create_direct_purchase_from_wallet", { p_promotion_id: promotionId });
    if (error) throw error;
    if (!data) throw new Error("L'achat n'a pas été créé.");
    return data as string;
  },
  async markDirectShipped(transactionId: string) {
    const { data, error } = await supabase.rpc("confirm_direct_shipped", { p_transaction_id: transactionId });
    if (error) throw error;
    return data;
  },
  async extendDirectShipping(transactionId: string) {
    const { data, error } = await supabase.rpc("extend_direct_shipping", { p_transaction_id: transactionId });
    if (error) throw error;
    return data;
  },
  async confirmDirectReception(transactionId: string) {
    const { data, error } = await supabase.rpc("confirm_direct_reception", { p_transaction_id: transactionId });
    if (error) throw error;
    return data;
  },
  async confirmDirectConformity(transactionId: string) {
    const { data, error } = await supabase.rpc("confirm_direct_conformity", { p_transaction_id: transactionId });
    if (error) throw error;
    return data;
  },
  // No generic create/updateStatus: financial state transitions are database-owned RPCs.
};