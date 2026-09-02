export const RESERVATION_STATUS_CONFIG = {
  acompte_paye: {
    label: 'Acompte payé',
    color: 'warning',
  },

  reservation_acceptee: {
    label: 'Réservation acceptée',
    color: 'info',
  },

  solde_paye: {
    label: 'Solde payé',
    color: 'info',
  },

  expediee: {
    label: 'Expédiée',
    color: 'info',
  },

  livree: {
    label: 'Livrée',
    color: 'success',
  },

  inspection: {
    label: 'Inspection',
    color: 'warning',
  },

  terminee: {
    label: 'Terminée',
    color: 'success',
  },

  annulee: {
    label: 'Annulée',
    color: 'danger',
  },

  expiree: {
    label: 'Expirée',
    color: 'danger',
  },

  litige: {
    label: 'Litige',
    color: 'danger',
  },
} as const;

export const PROMOTION_STATUS_CONFIG = {
  en_attente: {
    label: 'En attente',
    color: 'warning',
  },

  actif: {
    label: 'Active',
    color: 'success',
  },

  rejete: {
    label: 'Rejetée',
    color: 'danger',
  },

  expire: {
    label: 'Expirée',
    color: 'muted',
  },
} as const;

export const TRANSACTION_STATUS_CONFIG = {
  bloque: {
    label: 'Fonds bloqués',
    color: 'warning',
  },

  libere: {
    label: 'Fonds libérés',
    color: 'success',
  },

  rembourse: {
    label: 'Remboursée',
    color: 'info',
  },

  litige: {
    label: 'Litige',
    color: 'danger',
  },

  expiree: {
    label: 'Expirée',
    color: 'muted',
  },
} as const;