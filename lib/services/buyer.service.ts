import { supabase } from '@/lib/supabase/client';
async function uid(){const {data,error}=await supabase.auth.getUser();if(error||!data.user)throw new Error('Utilisateur non authentifié.');return data.user.id}
export const buyerService={
 async favorites(){const {data,error}=await supabase.from('favorites').select('*, promotion:promotions(*)').order('created_at',{ascending:false});if(error)throw error;return data??[]},
 async isFavorite(id:string){const {data,error}=await supabase.from('favorites').select('id').eq('promotion_id',id).maybeSingle();if(error)throw error;return !!data},
 async toggleFavorite(id:string){const u=await uid();const {data}=await supabase.from('favorites').select('id').eq('user_id',u).eq('promotion_id',id).maybeSingle();if(data){const {error}=await supabase.from('favorites').delete().eq('id',data.id);if(error)throw error;return false}const {error}=await supabase.from('favorites').insert({user_id:u,promotion_id:id});if(error)throw error;return true},
 async recent(id:string){const u=await uid();const {error}=await supabase.from('recent_views').upsert({user_id:u,promotion_id:id,viewed_at:new Date().toISOString()},{onConflict:'user_id,promotion_id'});if(error)throw error},
 async recentViews(){const {data,error}=await supabase.from('recent_views').select('*, promotion:promotions(*)').order('viewed_at',{ascending:false}).limit(12);if(error)throw error;return data??[]},
 async notifications(){const {data,error}=await supabase.from('notifications').select('*').order('created_at',{ascending:false}).limit(50);if(error)throw error;return data??[]},
 async unreadCount(){const {count,error}=await supabase.from('notifications').select('id',{count:'exact',head:true}).is('read_at',null);if(error)throw error;return count??0},
 async markRead(id:string){const {error}=await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id);if(error)throw error},
 async cart(){const {data,error}=await supabase.from('cart_items').select('*, promotion:promotions(*)').order('created_at');if(error)throw error;return data??[]},
 async addCart(id:string,q=1){const {error}=await supabase.rpc('add_to_cart',{p_promotion_id:id,p_quantity:q});if(error)throw error},
 async removeCart(id:string){const {error}=await supabase.from('cart_items').delete().eq('id',id);if(error)throw error},
 async updateCart(id:string,q:number){const {error}=await supabase.from('cart_items').update({quantity:q,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error},
 async checkout(address:unknown){const {data,error}=await supabase.rpc('checkout_cart',{p_delivery_address:address??null});if(error)throw error;return data as string[]},
 async alerts(){const {data,error}=await supabase.from('price_alerts').select('*').order('created_at',{ascending:false});if(error)throw error;return data??[]},
 async toggleAlert(id:string){const u=await uid();const {data}=await supabase.from('price_alerts').select('id').eq('user_id',u).eq('promotion_id',id).maybeSingle();if(data){const {error}=await supabase.from('price_alerts').delete().eq('id',data.id);if(error)throw error;return false}const {error}=await supabase.from('price_alerts').insert({user_id:u,promotion_id:id});if(error)throw error;return true}
};
