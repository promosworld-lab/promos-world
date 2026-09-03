import { supabase } from "@/lib/supabase/client";
import type { Wallet, WalletTransaction } from "@/lib/types";

export const walletService = {
  async getWallet(userId: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as Wallet | null;
  },

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const { data, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as WalletTransaction[];
  },
};
