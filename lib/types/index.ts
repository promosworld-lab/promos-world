export type UserRole = "client" | "vendeur" | "admin";

export type PromotionStatus =
  | "en_attente"
  | "actif"
  | "rejete"
  | "expire";

export type ReservationStatus =
  | "acompte_paye"
  | "reservation_acceptee"
  | "solde_paye"
  | "expediee"
  | "livree"
  | "inspection"
  | "terminee"
  | "annulee"
  | "expiree"
  | "litige";

export type TransactionStatus =
  | "bloque"
  | "libere"
  | "rembourse"
  | "litige"
  | "expiree";

export type TransactionType = "achat_direct" | "reservation";

export type WalletTransactionType =
  | "depot"
  | "retrait"
  | "achat"
  | "reservation"
  | "remboursement"
  | "liberation_fonds"
  | "commission"
  | "ajustement";

export type WalletTransactionStatus =
  | "en_attente"
  | "complete"
  | "echoue"
  | "annule";

export type DisputeStatus =
  | "ouvert"
  | "en_cours"
  | "resolu"
  | "rejete";

export interface Profile {
  id: string;
  nom: string;
  email?: string | null;
  role: UserRole;
  telephone?: string | null;
  adresse?: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  vendeur_id: string;
  titre: string;
  description?: string | null;
  categorie: string;
  prix_original: number;
  prix_promo: number;
  stock: number;
  date_expiration?: string | null;
  statut: PromotionStatus;
  photo_url?: string | null;
  media_type?: "image" | "video" | null;
  pays?: string | null;
  ville?: string | null;
  created_at: string;
  delai_livraison_jours?: number | null;
}

export interface Reservation {
  id: string;
  client_id: string;
  promotion_id: string;

  montant_acompte: number;
  montant_restant: number;

  statut: ReservationStatus;
  methode_paiement?: string | null;

  client_confirme: boolean;
  vendeur_confirme: boolean;

  date_expiration?: string | null;
  created_at: string;

  vendeur_decision?: string | null;
  vendeur_decision_at?: string | null;

  paiement_complet?: boolean | null;
  paiement_complet_at?: string | null;

  vendeur_expedie?: boolean | null;
  vendeur_expedie_at?: string | null;

  vendeur_confirme_livraison?: boolean | null;
  vendeur_confirme_livraison_at?: string | null;

  client_confirme_reception?: boolean | null;
  client_confirme_reception_at?: string | null;

  client_confirme_conformite?: boolean | null;
  client_confirme_conformite_at?: string | null;

  date_limite_acceptation?: string | null;
  date_limite_solde?: string | null;
  date_limite_expedition?: string | null;
  date_limite_livraison?: string | null;
  date_limite_inspection?: string | null;

  livraison_prolongee?: boolean | null;
  livraison_prolongation_at?: string | null;

  expedition_prolongee?: boolean | null;
  expedition_prolongation_at?: string | null;

  livraison_confirmee_at?: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;

  client_id: string;
  vendeur_id: string;
  promotion_id: string;
  reservation_id?: string | null;

  montant_total: number;
  montant_paye: number;
  commission_plateforme: number;

  methode_paiement?: string | null;
  statut: TransactionStatus;

  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  solde: number;
  created_at?: string;
}

export interface WalletTransaction {
  id: string;

  user_id: string;
  wallet_id: string;

  type: WalletTransactionType;
  montant: number;

  solde_avant: number;
  solde_apres: number;

  reference?: string | null;
  description?: string | null;

  statut: WalletTransactionStatus;

  promotion_id?: string | null;
  reservation_id?: string | null;
  transaction_id?: string | null;

  created_at?: string;
}

export interface Message {
  id: string;
  expediteur_id: string;
  destinataire_id: string;
  promotion_id?: string | null;
  contenu: string;
  lu: boolean;
  created_at: string;
}

export interface Avis {
  id: string;
  client_id: string;
  vendeur_id: string;
  reservation_id: string;
  note: number;
  commentaire?: string | null;
  created_at: string;
}

export interface Litige {
  id: string;
  transaction_id: string;
  client_id: string;
  promotion_id?: string | null;
  motif: string;
  statut: DisputeStatus;
  decision_admin?: string | null;
  created_at: string;
  updated_at: string;
}