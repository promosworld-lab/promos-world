import { supabase } from "@/lib/supabase";

export const walletService = {
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data;
  },

  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  async createWallet(userId: string) {
    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async getOrCreateWallet(userId: string) {
    let wallet = await this.getWallet(userId);

    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    return wallet;
  },
};