export const APP_NAME = "Promo's World";

export const APP_DESCRIPTION =
  "Découvrez des promotions exclusives et achetez en toute sécurité.";

export const DEFAULT_LANGUAGE = "fr";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;

export const PLATFORM_COMMISSION_RATE = 0.05;

export const RESERVATION_DEPOSIT_RATE = 0.3;

export const DEFAULT_CURRENCY = "FCFA";

export const PROMOTION_STATUS_LABELS = {
  en_attente: "En attente",
  actif: "Active",
  rejete: "Rejetée",
  expire: "Expirée",
};

export const RESERVATION_STATUS_LABELS = {
  acompte_paye: "Acompte payé",
  reservation_acceptee: "Réservation acceptée",
  solde_paye: "Solde payé",
  expediee: "Expédiée",
  livree: "Livrée",
  inspection: "Inspection",
  terminee: "Terminée",
  annulee: "Annulée",
  expiree: "Expirée",
  litige: "Litige",
};

export const TRANSACTION_STATUS_LABELS = {
  bloque: "Fonds bloqués",
  libere: "Fonds libérés",
  rembourse: "Remboursée",
  litige: "En litige",
  expiree: "Expirée",
};