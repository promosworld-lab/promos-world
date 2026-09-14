import { supabase } from '@/lib/supabase/client';
import type { Avis, Litige, Promotion, Reservation, Transaction, Wallet, WalletTransaction, PublicationPromotion } from '@/types/database';

export const sellerService = {
  async _getShopId(userId: string) {
    const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
    if (!data) throw new Error('Boutique introuvable.');
    return data.id;
  },
  async products(vendeurId: string) { const shopId = await this._getShopId(vendeurId); const { data, error } = await supabase.from('products').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }); if (error) throw error; return data; },
  async product(vendeurId: string, id: string) { const shopId = await this._getShopId(vendeurId); const { data, error } = await supabase.from('products').select('*').eq('shop_id', shopId).eq('id', id).single(); if (error) throw error; return data; },
  
  async orders(vendeurId: string) { 
    const shopId = await this._getShopId(vendeurId); 
    const { data, error } = await supabase.from('sub_orders').select('*, orders(buyer_id, shipping_address), order_items(*, products(title))').eq('shop_id', shopId).order('created_at', { ascending: false }); 
    if (error) throw error; 
    return data; 
  },
  async order(vendeurId: string, id: string) { 
    const shopId = await this._getShopId(vendeurId); 
    const { data, error } = await supabase.from('sub_orders').select('*, orders(buyer_id, shipping_address), order_items(*, products(*))').eq('shop_id', shopId).eq('id', id).single(); 
    if (error) throw error; 
    return data; 
  },
  
  async reservations(vendeurId: string) { 
    const shopId = await this._getShopId(vendeurId);
    const { data, error } = await supabase.from('reservations').select('*, products(*)').eq('products.shop_id', shopId).order('created_at', { ascending: false }); 
    if (error) throw error; return data; 
  },
  
  // Wallet/Ledger read-only for now
  async wallet(vendeurId: string) { 
    const { data, error } = await supabase.from('ledger_accounts').select('*').eq('owner_id', vendeurId).eq('type', 'user_wallet').single();
    if (error && error.code !== 'PGRST116') throw error; // ignore not found
    if (!data) return { solde_disponible: 0, solde_bloque: 0, solde: 0 };
    return {
      solde_disponible: data.balance,
      solde_bloque: data.held_balance,
      solde: data.balance + data.held_balance
    };
  },
  async walletTransactions(vendeurId: string) { 
    const { data: account } = await supabase.from('ledger_accounts').select('id').eq('owner_id', vendeurId).eq('type', 'user_wallet').single();
    if (!account) return [];
    
    const { data, error } = await supabase.from('ledger_transactions')
      .select('*')
      .or(`credit_account_id.eq.${account.id},debit_account_id.eq.${account.id}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(tx => ({
      id: tx.id,
      montant: tx.amount,
      type: tx.credit_account_id === account.id ? 'credit' : 'debit',
      statut: tx.status,
      description: tx.reference_type,
      created_at: tx.created_at
    }));
  },
  
  async reviews(vendeurId: string) { return []; },
  async disputes(vendeurId: string) { return []; },
  
  async campaigns(vendeurId: string) { 
    const shopId = await this._getShopId(vendeurId);
    const { data, error } = await supabase.from('sponsorship_campaigns').select('*, products(title)').eq('shop_id', shopId).order('created_at', { ascending: false }); 
    if (error) throw error; return data; 
  },
  
  async updateProduct(id: string, vendeurId: string, payload: any) { 
    const shopId = await this._getShopId(vendeurId);
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).eq('shop_id', shopId).select().single(); 
    if (error) throw error; return data; 
  },
  
  async shipOrder(id: string) {
    const { data, error } = await supabase.from('sub_orders').update({ status: 'shipped' }).eq('id', id).select();
    if (error) throw error; return data;
  }
};
