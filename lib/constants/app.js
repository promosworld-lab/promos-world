export const APP_NAME = "Promo's World"

export const APP_DESCRIPTION =
  "La marketplace des promotions et bonnes affaires."

export const SUPPORTED_LANGUAGES = ['fr', 'en']

export const ROLES = {
  CLIENT: 'client',
  VENDEUR: 'vendeur',
  ADMIN: 'admin',
}

export const PROMOTION_STATUS = {
  EN_ATTENTE: 'en_attente',
  ACTIF: 'actif',
  REJETE: 'rejete',
  EXPIRE: 'expire',
}

export const RESERVATION_STATUS = {
  ACOMPTE_PAYE: 'acompte_paye',
  RESERVATION_ACCEPTEE: 'reservation_acceptee',
  SOLDE_PAYE: 'solde_paye',
  EXPEDIEE: 'expediee',
  LIVREE: 'livree',
  INSPECTION: 'inspection',
  TERMINEE: 'terminee',
  ANNULEE: 'annulee',
  EXPIREE: 'expiree',
  LITIGE: 'litige',
}

export const TRANSACTION_STATUS = {
  BLOQUE: 'bloque',
  LIBERE: 'libere',
  REMBOURSE: 'rembourse',
  LITIGE: 'litige',
  EXPIREE: 'expiree',
}

export const LITIGE_STATUS = {
  OUVERT: 'ouvert',
  EN_COURS: 'en_cours',
  RESOLU: 'resolu',
  REJETE: 'rejete',
}

export const RESERVATION_RULES = {
  ACCOMPTE_PERCENTAGE: 20,
  VENDEUR_DECISION_HOURS: 36,
  EXPEDITION_HOURS: 48,
  INSPECTION_HOURS: 48,
  MAX_BALANCE_MONTHS: 3,
}

export const PROMOTION_CATEGORIES = [
  'Électronique',
  'Mode',
  'Beauté',
  'Maison',
  'Alimentation',
  'Automobile',
  'Services',
  'Voyage',
  'Sport',
  'Autres',
]