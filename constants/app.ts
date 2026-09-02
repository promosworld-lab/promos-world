export const APP_CONFIG = {
  name: "Promo's World",
  description: 'La plateforme moderne pour acheter, réserver et profiter des meilleures promotions.',
  version: '1.0.0',

  defaultLanguage: 'fr',

  supportedLanguages: ['fr', 'en'] as const,

  currency: 'XOF',
  currencySymbol: 'FCFA',

  simulationMode: true,

  supportEmail: '',
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
};