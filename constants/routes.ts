export const ROUTES = {
  HOME: '/',

  AUTH: '/auth',

  DASHBOARD: '/dashboard',

  PROMOTIONS: '/promo',

  RESERVATIONS: '/reservations',

  WALLET: '/wallet',

  TRANSACTIONS: '/transactions',

  MESSAGES: '/messages',

  PROFILE: '/profil',

  REVIEWS: '/avis',

  DISPUTES: '/litiges',

  ADMIN: '/admin',

  ADMIN_TRANSACTIONS: '/admin/transactions',

  ADMIN_DISPUTES: '/admin/litiges',
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/auth',
];

export const AUTH_ROUTES = [
  '/dashboard',
  '/wallet',
  '/transactions',
  '/messages',
  '/profil',
  '/reservations',
  '/avis',
  '/litiges',
  '/acheter',
  '/reserver',
  '/chat',
];

export const ADMIN_ROUTES = [
  '/admin',
];