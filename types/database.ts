export type UserRole = "client" | "vendeur" | "admin";
export type KycStatus = "non_soumis" | "en_attente" | "verifie" | "rejete";
export type PublicationType = "article" | "promotion";
export type PromotionStatus = "en_attente" | "actif" | "rejete" | "expire";

export interface Profile {
  id:string; nom:string; email?:string|null; role:UserRole;
  telephone?:string|null; adresse?:string|null;
  pays?:string|null; ville?:string|null; kyc_status?:KycStatus|null;
  created_at:string;
}
export interface Promotion {
  id:string; vendeur_id:string; titre:string; description?:string|null; categorie:string;
  prix_original:number; prix_promo:number; stock:number; date_expiration?:string|null;
  statut:PromotionStatus; photo_url?:string|null; media_type?:"image"|"video"|null;
  pays?:string|null; ville?:string|null; created_at:string; delai_livraison_jours?:number|null;
  type?:PublicationType;
}
export type ReservationStatus = "acompte_paye"|"reservation_acceptee"|"solde_paye"|"expediee"|"livree"|"inspection"|"terminee"|"annulee"|"expiree"|"litige";
export interface Reservation { id:string;client_id:string;promotion_id:string;montant_acompte:number;montant_restant:number;statut:ReservationStatus;methode_paiement?:string|null;client_confirme:boolean;vendeur_confirme:boolean;date_expiration?:string|null;created_at:string;[key:string]:any; }
export interface Transaction {id:string;type:string;client_id:string;vendeur_id:string;promotion_id:string;reservation_id?:string|null;montant_total:number;montant_paye:number;commission_plateforme:number;methode_paiement?:string|null;statut:string;created_at:string;}
export interface Wallet {id:string;user_id:string;solde?:number;created_at?:string;}
export interface WalletTransaction {id:string;user_id:string;wallet_id:string;type:string;montant:number;solde_avant:number;solde_apres:number;reference?:string|null;description?:string|null;created_at?:string;}
export interface Message {id:string;expediteur_id:string;destinataire_id:string;promotion_id?:string|null;contenu:string;lu:boolean;created_at:string;}
export interface Avis {id:string;client_id:string;vendeur_id:string;reservation_id:string;note:number;commentaire?:string|null;created_at:string;}
export interface Litige {id:string;transaction_id:string;client_id:string;promotion_id?:string|null;motif:string;statut:"ouvert"|"en_cours"|"resolu"|"rejete";decision_admin?:string|null;created_at:string;updated_at:string;}