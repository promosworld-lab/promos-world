export const ROUTES = {
  HOME: '/', AUTH: '/auth', MARKETPLACE: '/promo',
  BUYER: { PROFILE: '/profil', WALLET: '/wallet', TRANSACTIONS: '/transactions', RESERVATIONS: '/reservations', REVIEWS: '/avis', DISPUTES: '/litiges', MESSAGES: '/messages', CART: '/panier', FAVORITES: '/favoris', NOTIFICATIONS: '/notifications', ADDRESSES: '/adresses' },
  SELLER: { ROOT: '/vendeur', DASHBOARD: '/vendeur/dashboard', PRODUCTS: '/vendeur/produits', ORDERS: '/vendeur/commandes', RESERVATIONS: '/vendeur/reservations', WALLET: '/vendeur/portefeuille', REVIEWS: '/vendeur/avis', DISPUTES: '/vendeur/litiges', MESSAGES: '/vendeur/messages', MARKETING: '/vendeur/marketing', ANALYTICS: '/vendeur/analytics', STORE: '/vendeur/boutique', NOTIFICATIONS: '/vendeur/notifications', SETTINGS: '/vendeur/parametres', PUBLISH: '/publier', PROMOTE: '/promouvoir' },
  ADMIN: '/admin', ADMIN_TRANSACTIONS: '/admin/transactions', ADMIN_DISPUTES: '/admin/litiges',
} as const;

export const PUBLIC_ROUTES = ['/', '/auth', '/promo'];

export const BUYER_ROUTES = ['/wallet','/transactions','/messages','/profil','/reservations','/avis','/litiges','/acheter','/reserver','/chat','/panier','/favoris','/notifications','/adresses'];
export const SELLER_ROUTES = ['/vendeur','/dashboard','/publier','/promouvoir'];
export const ADMIN_ROUTES = ['/admin'];

export const AUTH_ROUTES = [...BUYER_ROUTES, ...SELLER_ROUTES];
