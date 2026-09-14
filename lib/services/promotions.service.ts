import { supabase } from '@/lib/supabase/client';
import type { Promotion } from '@/types/database';

export type PromotionInput = Omit<Partial<Promotion>, 'id'|'vendeur_id'|'created_at'|'updated_at'> & {
  titre: string; categorie: string; prix_original: number; prix_promo: number; stock: number;
};

// HELPER to map old Promotion struct to new Product struct
function mapInputToProduct(vendeurId: string, payload: PromotionInput, shopId: string) {
  return {
    shop_id: shopId,
    title: payload.titre,
    description: payload.description || '',
    price: payload.prix_original,
    promo_price: payload.prix_promo,
    stock: payload.stock,
    status: payload.is_active === false ? 'inactive' : 'active',
    type: payload.publication_type === 'promotion' ? 'promo' : 'standard',
    // In V2, we might not have `pays` in products directly, ignoring it or mapping it to shipping_zones
  };
}

export const promotionsService = {
  async _getShopId(userId: string) {
    const { data } = await supabase.from('shops').select('id').eq('owner_id', userId).single();
    if (!data) throw new Error('Boutique introuvable.');
    return data.id;
  },
  
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase.from('products').select('*').eq('status','active').gt('stock',0).order('created_at',{ascending:false});
    if (error) throw error; return data;
  },
  async getById(id:string) { const {data,error}=await supabase.from('products').select('*').eq('id',id).maybeSingle(); if(error)throw error; return data; },
  async getByVendeur(vendeurId:string) { 
    const shopId = await this._getShopId(vendeurId);
    const {data,error}=await supabase.from('products').select('*').eq('shop_id',shopId).order('created_at',{ascending:false}); 
    if(error)throw error; return data; 
  },
  async create(payload:PromotionInput) { 
    const {data:{user}}=await supabase.auth.getUser(); 
    if(!user)throw new Error('Utilisateur non authentifié.'); 
    const shopId = await this._getShopId(user.id);
    const mapped = mapInputToProduct(user.id, payload, shopId);
    
    const {data,error}=await supabase.from('products').insert(mapped).select().single(); 
    if(error) throw error; 
    return data; 
  },
  async update(id:string,payload:Partial<PromotionInput>) { 
    // Simplified update (if needed, map to product fields)
    const {data,error}=await supabase.from('products').update(payload).eq('id',id).select().single(); 
    if(error)throw error; return data; 
  },
  async stop(id:string) { const {error}=await supabase.from('products').update({ status: 'inactive' }).eq('id', id); if(error)throw error; },
  async delete(id:string) { const {error}=await supabase.from('products').delete().eq('id',id); if(error)throw error; }
};
