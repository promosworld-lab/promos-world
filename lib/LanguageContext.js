'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext(null)

export const translations = {
  fr: {
    language: 'Français',
    otherLanguage: 'English',

    searchPlaceholder: 'Rechercher une promotion...',
    login: 'Se connecter',
    dashboard: 'Dashboard',
    start: 'Commencer',

    discoverBadge: '🔥 LES BONNES AFFAIRES',
    heroTitle: 'Trouve les meilleures',
    heroTitleAccent: ' promos.',
    heroDescription:
      "Découvre des offres proposées par des vendeurs, réserve un article ou achète directement en toute sécurité.",
    discoverPromoWorld: "Découvrir Promo's World",

    all: 'Toutes',
    promotions: 'Promotions',
    offer: 'offre',
    offers: 'offres',
    publishPromo: '＋ Publier une promo',

    loading: 'Chargement des promotions...',
    noPromotion: 'Aucune promotion trouvée',
    tryAgain: 'Essaie une autre recherche ou une autre catégorie.',

    seller: 'Vendeur',
    available: 'disponible',
    availables: 'disponibles',
    soldOut: 'Épuisé',

    footer: "Promo's World · Marketplace de promotions",

    aboutTitle: "Bienvenue sur Promo's World",
    aboutSubtitle:
      "La marketplace qui permet de découvrir, réserver et acheter des produits et services en promotion.",
    aboutWhatTitle: "Qu'est-ce que Promo's World ?",
    aboutWhatText:
      "Promo's World est une marketplace pensée pour mettre en relation des clients et des vendeurs autour d'offres promotionnelles. Les clients peuvent découvrir des promotions, réserver un article, utiliser leur wallet et suivre leur commande directement depuis la plateforme.",

    howTitle: 'Comment ça fonctionne ?',
    clientTitle: 'Pour les clients',
    clientSteps: [
      'Découvre une promotion qui t’intéresse.',
      'Consulte les informations du vendeur et de l’offre.',
      'Réserve l’article en versant l’acompte prévu.',
      'Paie le solde dans le délai prévu.',
      'Suis l’expédition et confirme la réception.',
      'Vérifie la conformité du produit avant la libération des fonds.'
    ],

    sellerTitle: 'Pour les vendeurs',
    sellerSteps: [
      'Publie une promotion avec des informations exactes.',
      'Reçois les demandes de réservation.',
      'Accepte ou refuse une réservation dans le délai prévu.',
      'Expédie la commande après les conditions de paiement.',
      'Confirme les différentes étapes de la livraison.',
      'Respecte les règles de la plateforme et les délais annoncés.'
    ],

    financialTitle: 'Règles financières',
    depositTitle: 'Acompte',
    depositText:
      "Une réservation nécessite un acompte correspondant à 20 % du prix de la promotion.",
    balanceTitle: 'Solde',
    balanceText:
      'Le solde restant doit être payé dans le délai prévu pour la réservation.',
    blockedTitle: 'Fonds bloqués',
    blockedText:
      'Les fonds liés à une réservation peuvent rester bloqués jusqu’à la validation des différentes étapes de la transaction.',

    deadlinesTitle: 'Délais importants',
    sellerDecision: 'Décision du vendeur : 36 heures',
    shipping: 'Expédition : 48 heures après les conditions requises',
    balanceDeadline: 'Paiement du solde : jusqu’à 3 mois',
    inspection: 'Vérification de la réception et de la conformité : 48 heures',

    disputeTitle: 'Litiges',
    disputeText:
      "En cas de problème, le client peut ouvrir un litige depuis la plateforme. L'administration examine le dossier et prend une décision conformément aux règles de Promo's World.",

    expirationTitle: 'Expiration après 3 mois',
    expirationText:
      "Si le solde n'est pas payé dans le délai prévu et que la réservation arrive à expiration, les fonds concernés sont répartis conformément aux règles financières de la plateforme.",

    securityTitle: 'Sécurité',
    securityText:
      "Ne communique jamais ton mot de passe, tes codes de validation ou tes informations sensibles à une autre personne. Utilise uniquement les fonctionnalités officielles de Promo's World pour tes transactions.",

    backHome: "← Retour à l'accueil",
  },

  en: {
    language: 'English',
    otherLanguage: 'Français',

    searchPlaceholder: 'Search for a promotion...',
    login: 'Log in',
    dashboard: 'Dashboard',
    start: 'Get started',

    discoverBadge: '🔥 GREAT DEALS',
    heroTitle: 'Find the best',
    heroTitleAccent: ' deals.',
    heroDescription:
      'Discover offers from sellers, reserve an item or buy directly and securely.',
    discoverPromoWorld: "Discover Promo's World",

    all: 'All',
    promotions: 'Promotions',
    offer: 'offer',
    offers: 'offers',
    publishPromo: '＋ Publish a promotion',

    loading: 'Loading promotions...',
    noPromotion: 'No promotion found',
    tryAgain: 'Try another search or category.',

    seller: 'Seller',
    available: 'available',
    availables: 'available',
    soldOut: 'Sold out',

    footer: "Promo's World · Promotions marketplace",

    aboutTitle: "Welcome to Promo's World",
    aboutSubtitle:
      'The marketplace for discovering, reserving and buying products and services on promotion.',
    aboutWhatTitle: "What is Promo's World?",
    aboutWhatText:
      "Promo's World is a marketplace designed to connect customers and sellers around promotional offers. Customers can discover promotions, reserve an item, use their wallet and track their order directly from the platform.",

    howTitle: 'How does it work?',
    clientTitle: 'For customers',
    clientSteps: [
      'Discover a promotion that interests you.',
      'Check the seller and offer information.',
      'Reserve the item by paying the required deposit.',
      'Pay the remaining balance within the required period.',
      'Track the shipment and confirm reception.',
      'Check the product before the funds are released.'
    ],

    sellerTitle: 'For sellers',
    sellerSteps: [
      'Publish a promotion with accurate information.',
      'Receive reservation requests.',
      'Accept or reject a reservation within the required period.',
      'Ship the order once the payment conditions are met.',
      'Confirm the different delivery steps.',
      'Respect the platform rules and announced deadlines.'
    ],

    financialTitle: 'Financial rules',
    depositTitle: 'Deposit',
    depositText:
      'A reservation requires a deposit equal to 20% of the promotion price.',
    balanceTitle: 'Balance',
    balanceText:
      'The remaining balance must be paid within the period specified for the reservation.',
    blockedTitle: 'Blocked funds',
    blockedText:
      'Funds related to a reservation may remain blocked until the different transaction steps have been validated.',

    deadlinesTitle: 'Important deadlines',
    sellerDecision: 'Seller decision: 36 hours',
    shipping: 'Shipping: 48 hours after the required conditions are met',
    balanceDeadline: 'Balance payment: up to 3 months',
    inspection: 'Reception and conformity check: 48 hours',

    disputeTitle: 'Disputes',
    disputeText:
      "If there is a problem, the customer can open a dispute from the platform. The administration reviews the case and makes a decision according to Promo's World rules.",

    expirationTitle: 'Expiration after 3 months',
    expirationText:
      'If the balance is not paid within the required period and the reservation expires, the relevant funds are distributed according to the platform financial rules.',

    securityTitle: 'Security',
    securityText:
      "Never share your password, verification codes or sensitive information with anyone. Use only Promo's World official features for your transactions.",

    backHome: '← Back to home',
  },
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('promos-world-language')

    if (savedLanguage === 'fr' || savedLanguage === 'en') {
      setLanguage(savedLanguage)
    }

    setReady(true)
  }, [])

  const changeLanguage = (newLanguage) => {
    if (newLanguage !== 'fr' && newLanguage !== 'en') return

    setLanguage(newLanguage)
    localStorage.setItem('promos-world-language', newLanguage)
  }

  const t = translations[language]

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        t,
        ready,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error(
      'useLanguage doit être utilisé à l’intérieur de LanguageProvider'
    )
  }

  return context
}