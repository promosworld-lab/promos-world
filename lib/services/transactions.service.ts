import { supabase } from "@/lib/supabase/client";
import type { Transaction } from "@/types/database";
export type DeliveryAddress={recipient_name:string;phone:string;address:string;city:string;country:string;instructions?:string};
export const transactionsService={
 async getByClient(clientId:string):Promise<Transaction[]>{const{data,error}=await supabase.from("transactions").select("*, promotion:promotions(*), vendeur:profiles!transactions_vendeur_id_fkey(*)").eq("client_id",clientId).order("created_at",{ascending:false});if(error)throw error;return(data??[])as Transaction[]},
 async getByVendeur(vendeurId:string):Promise<Transaction[]>{const{data,error}=await supabase.from("transactions").select("*, promotion:promotions(titre,photo_url), client:profiles!transactions_client_id_fkey(nom,telephone)").eq("vendeur_id",vendeurId).order("created_at",{ascending:false});if(error)throw error;return(data??[])as Transaction[]},
 async getById(id:string):Promise<Transaction>{const{data,error}=await supabase.from("transactions").select("*, promotion:promotions(*), client:profiles!transactions_client_id_fkey(*), vendeur:profiles!transactions_vendeur_id_fkey(*)").eq("id",id).single();if(error)throw error;return data as Transaction},
 async createDirectPurchase(promotionId:string,quantity=1,deliveryAddress:DeliveryAddress|null=null):Promise<string>{const{data,error}=await supabase.rpc("create_direct_purchase_from_wallet",{p_promotion_id:promotionId,p_quantity:quantity,p_delivery_address:deliveryAddress});if(error)throw error;if(!data)throw new Error("L'achat n'a pas été créé.");return data as string},
 async markDirectShipped(id:string){const{data,error}=await supabase.rpc("confirm_direct_shipped",{p_transaction_id:id});if(error)throw error;return data},
 async extendDirectShipping(id:string){const{data,error}=await supabase.rpc("extend_direct_shipping",{p_transaction_id:id});if(error)throw error;return data},
 async confirmDirectReception(id:string){const{data,error}=await supabase.rpc("confirm_direct_reception",{p_transaction_id:id});if(error)throw error;return data},
 async confirmDirectConformity(id:string){const{data,error}=await supabase.rpc("confirm_direct_conformity",{p_transaction_id:id});if(error)throw error;return data}
};