'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function AboutPage() {
  const router = useRouter()
  const { language, setLanguage, ready } = useLanguage()

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        Chargement...
      </div>
    )
  }

  const fr = language === 'fr'

  return (
    <div className="about-page">
      <style jsx>{`
        .about-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .container {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          padding: 18px 20px 70px;
          box-sizing: border-box;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 25px;
        }

        .top-button {
          padding: 10px 14px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .hero {
          background:
            linear-gradient(
              135deg,
              #171717 0%,
              #111 60%,
              #18100a 100%
            );
          border: 1px solid #292929;
          border-radius: 24px;
          padding: 50px 35px;
          margin-bottom: 16px;
        }

        .badge {
          display: inline-block;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255, 92, 0, 0.1);
          border: 1px solid rgba(255, 92, 0, 0.25);
          color: #ff8a45;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 15px;
        }

        h1 {
          margin: 0 0 16px;
          font-size: clamp(32px, 6vw, 55px);
          line-height: 1.05;
          font-weight: 900;
        }

        .hero-text {
          max-width: 760px;
          margin: 0;
          color: #999;
          font-size: 15px;
          line-height: 1.8;
        }

        .section {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          padding: 28px;
          margin-top: 14px;
        }

        .section h2 {
          margin: 0 0 13px;
          font-size: 22px;
          font-weight: 900;
        }

        .section h3 {
          margin: 20px 0 8px;
          font-size: 15px;
          font-weight: 800;
          color: #ff7a2a;
        }

        .section p {
          margin: 0;
          color: #999;
          font-size: 13px;
          line-height: 1.85;
        }

        .section p + p {
          margin-top: 12px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 14px;
        }

        .card {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          padding: 25px;
        }

        .card h2 {
          margin: 0 0 14px;
          font-size: 19px;
          font-weight: 900;
        }

        .card p {
          color: #999;
          font-size: 13px;
          line-height: 1.8;
        }

        .steps {
          margin: 0;
          padding: 0;
          list-style: none;
          counter-reset: steps;
        }

        .steps li {
          position: relative;
          padding: 13px 13px 13px 45px;
          margin-bottom: 8px;
          background: #101010;
          border: 1px solid #242424;
          border-radius: 12px;
          color: #aaa;
          font-size: 13px;
          line-height: 1.6;
          counter-increment: steps;
        }

        .steps li::before {
          content: counter(steps);
          position: absolute;
          left: 13px;
          top: 11px;
          width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 92, 0, 0.12);
          border: 1px solid rgba(255, 92, 0, 0.25);
          border-radius: 50%;
          color: #ff7a2a;
          font-size: 11px;
          font-weight: 900;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .rule {
          padding: 17px;
          background: #101010;
          border: 1px solid #242424;
          border-radius: 14px;
        }

        .rule strong {
          display: block;
          color: #ff7a2a;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .rule span {
          display: block;
          color: #999;
          font-size: 12px;
          line-height: 1.65;
        }

        .important {
          border-color: rgba(255, 92, 0, 0.3);
          background: rgba(255, 92, 0, 0.05);
        }

        .final-message {
          text-align: center;
          padding: 35px 20px;
          color: #888;
          font-size: 13px;
          line-height: 1.8;
        }

        .home-button {
          margin-top: 18px;
          padding: 12px 18px;
          background: #ff5c00;
          border: none;
          border-radius: 11px;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .footer {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #1e1e1e;
          text-align: center;
          color: #666;
          font-size: 11px;
        }

        @media (max-width: 700px) {
          .container {
            padding: 14px 13px 45px;
          }

          .hero {
            padding: 32px 20px;
            border-radius: 18px;
          }

          .section,
          .card {
            padding: 20px;
            border-radius: 16px;
          }

          .grid-2,
          .rules-grid {
            grid-template-columns: 1fr;
          }

          .top-button {
            font-size: 11px;
            padding: 9px 10px;
          }

          .hero-text {
            font-size: 13px;
          }

          .section h2 {
            font-size: 19px;
          }
        }
      `}</style>

      <main className="container">
        {/* TOP BAR */}
        <div className="topbar">
          <button
            className="top-button"
            onClick={() => router.push('/')}
          >
            {fr ? "← Retour à l'accueil" : '← Back to home'}
          </button>

          <button
            className="top-button"
            onClick={() =>
              setLanguage(fr ? 'en' : 'fr')
            }
          >
            {fr ? '🇬🇧 English' : '🇫🇷 Français'}
          </button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="badge">
            PROMO'S WORLD
          </div>

          <h1>
            {fr
              ? "Bienvenue sur Promo's World"
              : "Welcome to Promo's World"}
          </h1>

          <p className="hero-text">
            {fr
              ? "Promo's World est une marketplace conçue pour permettre aux clients de découvrir des offres promotionnelles, de réserver des produits ou de les acheter directement, tout en offrant aux vendeurs un espace pour présenter leurs offres et gérer leurs ventes."
              : "Promo's World is a marketplace designed to help customers discover promotional offers, reserve products or buy them directly, while giving sellers a space to showcase their offers and manage their sales."}
          </p>
        </section>

        {/* WHAT IS PROMO'S WORLD */}
        <section className="section">
          <h2>
            {fr
              ? "🛍️ Qu'est-ce que Promo's World ?"
              : "🛍️ What is Promo's World?"}
          </h2>

          <p>
            {fr
              ? "Promo's World met en relation des vendeurs et des clients autour de produits et d'offres promotionnelles. L'objectif est de rendre l'accès aux bonnes affaires plus simple, tout en proposant un cadre structuré pour les transactions."
              : "Promo's World connects sellers and customers around products and promotional offers. The goal is to make great deals easier to discover while providing a structured environment for transactions."}
          </p>

          <p>
            {fr
              ? "La plateforme permet notamment de consulter les promotions disponibles, de rechercher une offre, de consulter les informations du vendeur, de réserver un produit ou de réaliser un achat direct lorsque cette option est disponible."
              : "The platform allows users to browse promotions, search for offers, view seller information, reserve products or make a direct purchase when this option is available."}
          </p>
        </section>

        {/* TWO WAYS */}
        <div className="grid-2">
          <div className="card">
            <h2>
              🛒{' '}
              {fr
                ? 'Achat direct'
                : 'Direct purchase'}
            </h2>

            <p>
              {fr
                ? "Lorsque l'achat direct est disponible, le client paie le montant demandé depuis son wallet. Les fonds sont ensuite gérés selon le processus de transaction de Promo's World et ne sont pas simplement transférés immédiatement au vendeur."
                : "When direct purchase is available, the customer pays the required amount from their wallet. The funds are then managed according to Promo's World transaction process rather than being immediately transferred to the seller."}
            </p>
          </div>

          <div className="card">
            <h2>
              📋{' '}
              {fr
                ? 'Réservation'
                : 'Reservation'}
            </h2>

            <p>
              {fr
                ? "La réservation permet au client de sécuriser une offre en versant l'acompte prévu. Le reste du montant est ensuite réglé selon les conditions et délais applicables à la réservation."
                : "Reservation allows a customer to secure an offer by paying the required deposit. The remaining amount is then paid according to the conditions and deadlines applicable to the reservation."}
            </p>
          </div>
        </div>

        {/* CLIENT PROCESS */}
        <section className="section">
          <h2>
            👤{' '}
            {fr
              ? 'Comment ça fonctionne pour un client ?'
              : 'How does it work for a customer?'}
          </h2>

          <ol className="steps">
            <li>
              {fr
                ? "Le client parcourt les promotions disponibles et choisit une offre."
                : 'The customer browses available promotions and chooses an offer.'}
            </li>

            <li>
              {fr
                ? "Il consulte les détails du produit, le prix, le stock et les informations du vendeur."
                : 'They check the product details, price, stock and seller information.'}
            </li>

            <li>
              {fr
                ? "Selon l'offre, il peut acheter directement ou effectuer une réservation."
                : 'Depending on the offer, they can make a direct purchase or a reservation.'}
            </li>

            <li>
              {fr
                ? "Le paiement est effectué à travers le wallet Promo's World lorsque le processus l'exige."
                : "Payment is made through the Promo's World wallet when required by the process."}
            </li>

            <li>
              {fr
                ? "Le client suit ensuite les différentes étapes de la transaction depuis son espace."
                : 'The customer then tracks the different transaction steps from their account.'}
            </li>

            <li>
              {fr
                ? "Après réception, il vérifie le produit et confirme sa conformité lorsque cela est nécessaire."
                : 'After receiving the product, they inspect it and confirm its conformity when required.'}
            </li>
          </ol>
        </section>

        {/* SELLER PROCESS */}
        <section className="section">
          <h2>
            🏪{' '}
            {fr
              ? 'Comment ça fonctionne pour un vendeur ?'
              : 'How does it work for a seller?'}
          </h2>

          <ol className="steps">
            <li>
              {fr
                ? "Le vendeur publie une promotion avec des informations exactes sur le produit, le prix et le stock."
                : 'The seller publishes a promotion with accurate product, price and stock information.'}
            </li>

            <li>
              {fr
                ? "Les clients peuvent découvrir son offre et effectuer une réservation ou un achat direct selon les options disponibles."
                : 'Customers can discover the offer and make a reservation or direct purchase depending on the available options.'}
            </li>

            <li>
              {fr
                ? "Pour une réservation, le vendeur doit traiter la demande dans le délai prévu."
                : 'For a reservation, the seller must process the request within the required period.'}
            </li>

            <li>
              {fr
                ? "Lorsque les conditions sont réunies, le vendeur prépare et expédie la commande."
                : 'Once the required conditions are met, the seller prepares and ships the order.'}
            </li>

            <li>
              {fr
                ? "Le vendeur confirme les étapes qui lui sont attribuées depuis son espace."
                : 'The seller confirms the steps assigned to them from their account.'}
            </li>

            <li>
              {fr
                ? "Le vendeur doit respecter les informations annoncées, les délais et les règles de la plateforme."
                : 'The seller must respect the advertised information, deadlines and platform rules.'}
            </li>
          </ol>
        </section>

        {/* WALLET */}
        <section className="section">
          <h2>
            💰{' '}
            {fr
              ? 'Le wallet Promo’s World'
              : "Promo's World wallet"}
          </h2>

          <p>
            {fr
              ? "Le wallet est le portefeuille numérique utilisé sur la plateforme pour gérer les fonds nécessaires aux opérations prises en charge par Promo's World."
              : "The wallet is the digital wallet used on the platform to manage funds required for operations supported by Promo's World."}
          </p>

          <p>
            {fr
              ? "Le solde disponible correspond aux fonds que l'utilisateur peut utiliser. Les fonds bloqués correspondent à des montants temporairement immobilisés dans le cadre d'une transaction."
              : "Available balance represents funds the user can use. Blocked funds are amounts temporarily held as part of a transaction."}
          </p>
        </section>

        {/* FINANCIAL RULES */}
        <section className="section">
          <h2>
            💳{' '}
            {fr
              ? 'Règles financières principales'
              : 'Main financial rules'}
          </h2>

          <div className="rules-grid">
            <div className="rule">
              <strong>
                {fr ? '20 % — Acompte' : '20% — Deposit'}
              </strong>

              <span>
                {fr
                  ? "Pour une réservation, l'acompte prévu correspond à 20 % du prix de la promotion."
                  : 'For a reservation, the required deposit is 20% of the promotion price.'}
              </span>
            </div>

            <div className="rule">
              <strong>
                {fr ? '80 % — Solde' : '80% — Balance'}
              </strong>

              <span>
                {fr
                  ? "Le solde restant correspond aux 80 % restants et doit être payé dans le délai applicable."
                  : 'The remaining balance corresponds to the remaining 80% and must be paid within the applicable period.'}
              </span>
            </div>

            <div className="rule">
              <strong>
                {fr ? 'Fonds bloqués' : 'Held funds'}
              </strong>

              <span>
                {fr
                  ? "Les fonds peuvent être bloqués jusqu'à ce que les validations nécessaires soient terminées."
                  : 'Funds may remain held until the required validations have been completed.'}
              </span>
            </div>

            <div className="rule">
              <strong>
                {fr ? 'Commission' : 'Platform fee'}
              </strong>

              <span>
                {fr
                  ? "La plateforme applique les frais prévus par son système financier lorsque la transaction est finalisée."
                  : 'The platform applies the fees defined by its financial system when the transaction is finalized.'}
              </span>
            </div>
          </div>
        </section>

        {/* DEADLINES */}
        <section className="section">
          <h2>
            ⏳{' '}
            {fr
              ? 'Les délais importants'
              : 'Important deadlines'}
          </h2>

          <div className="rules-grid">
            <div className="rule">
              <strong>36 h</strong>
              <span>
                {fr
                  ? "Le vendeur dispose du délai prévu pour accepter ou refuser une réservation."
                  : 'The seller has the defined period to accept or reject a reservation.'}
              </span>
            </div>

            <div className="rule">
              <strong>48 h</strong>
              <span>
                {fr
                  ? "Le vendeur doit respecter le délai d'expédition prévu après que les conditions nécessaires sont réunies."
                  : 'The seller must respect the defined shipping deadline once the required conditions are met.'}
              </span>
            </div>

            <div className="rule">
              <strong>3 mois</strong>
              <span>
                {fr
                  ? "Une réservation dispose d'une période maximale de trois mois pour le règlement du solde."
                  : 'A reservation has a maximum period of three months for payment of the remaining balance.'}
              </span>
            </div>

            <div className="rule">
              <strong>48 h</strong>
              <span>
                {fr
                  ? "Après réception, le client dispose du délai prévu pour vérifier la commande et signaler un problème."
                  : 'After reception, the customer has the defined period to inspect the order and report a problem.'}
              </span>
            </div>
          </div>
        </section>

        {/* DELIVERY */}
        <section className="section">
          <h2>
            📦{' '}
            {fr
              ? 'Expédition, réception et conformité'
              : 'Shipping, reception and conformity'}
          </h2>

          <h3>
            {fr
              ? "1. L'expédition"
              : '1. Shipping'}
          </h3>

          <p>
            {fr
              ? "Une fois les conditions nécessaires réunies, le vendeur doit procéder à l'expédition dans le délai prévu. Les informations de suivi peuvent ensuite être utilisées pour suivre l'évolution de la commande."
              : 'Once the required conditions are met, the seller must ship within the defined period. Tracking information may then be used to follow the order.'}
          </p>

          <h3>
            {fr
              ? '2. La réception'
              : '2. Reception'}
          </h3>

          <p>
            {fr
              ? "Le client confirme la réception lorsqu'il a effectivement reçu la commande."
              : 'The customer confirms reception once they have actually received the order.'}
          </p>

          <h3>
            {fr
              ? '3. La conformité'
              : '3. Conformity'}
          </h3>

          <p>
            {fr
              ? "Le client vérifie ensuite que le produit reçu correspond à l'offre annoncée. En cas de problème, il peut utiliser le système de litige."
              : 'The customer then checks that the received product matches the advertised offer. If there is a problem, they can use the dispute system.'}
          </p>
        </section>

        {/* DISPUTES */}
        <section className="section important">
          <h2>
            ⚠️{' '}
            {fr
              ? 'Que se passe-t-il en cas de problème ?'
              : 'What happens if there is a problem?'}
          </h2>

          <p>
            {fr
              ? "Si un client rencontre un problème avec une transaction, il peut ouvrir un litige depuis la plateforme. Le dossier peut alors être examiné par l'administration."
              : 'If a customer encounters a problem with a transaction, they can open a dispute from the platform. The case can then be reviewed by the administration.'}
          </p>

          <p>
            {fr
              ? "L'objectif du système de litige est de permettre aux différentes parties de présenter les informations nécessaires afin qu'une décision puisse être prise conformément aux règles de Promo's World."
              : "The purpose of the dispute system is to allow the parties to provide the necessary information so that a decision can be made according to Promo's World rules."}
          </p>
        </section>

        {/* EXPIRATION */}
        <section className="section">
          <h2>
            📅{' '}
            {fr
              ? 'Expiration après 3 mois'
              : 'Expiration after 3 months'}
          </h2>

          <p>
            {fr
              ? "Lorsqu'une réservation arrive à expiration parce que le solde n'a pas été réglé dans le délai prévu, le système applique les règles d'expiration définies par Promo's World."
              : "When a reservation expires because the balance has not been paid within the required period, the system applies Promo's World expiration rules."}
          </p>

          <div className="rules-grid">
            <div className="rule">
              <strong>50 %</strong>
              <span>
                {fr
                  ? 'Part prévue pour le client.'
                  : 'Share allocated to the customer.'}
              </span>
            </div>

            <div className="rule">
              <strong>25 %</strong>
              <span>
                {fr
                  ? 'Part prévue pour le vendeur.'
                  : 'Share allocated to the seller.'}
              </span>
            </div>

            <div className="rule">
              <strong>25 %</strong>
              <span>
                {fr
                  ? 'Part prévue pour la plateforme.'
                  : 'Share allocated to the platform.'}
              </span>
            </div>
          </div>
        </section>

        {/* RESPONSIBILITIES */}
        <div className="grid-2">
          <div className="card">
            <h2>
              👤{' '}
              {fr
                ? 'Responsabilités du client'
                : 'Customer responsibilities'}
            </h2>

            <p>
              {fr
                ? "Le client doit fournir des informations correctes, disposer des fonds nécessaires, respecter les délais de paiement, vérifier sa commande à la réception et signaler rapidement tout problème."
                : 'Customers must provide accurate information, have the required funds, respect payment deadlines, inspect their order upon reception and report problems promptly.'}
            </p>
          </div>

          <div className="card">
            <h2>
              🏪{' '}
              {fr
                ? 'Responsabilités du vendeur'
                : 'Seller responsibilities'}
            </h2>

            <p>
              {fr
                ? "Le vendeur doit publier des informations exactes, respecter ses engagements, traiter les réservations dans les délais, expédier les commandes dans les conditions prévues et fournir un produit conforme à son annonce."
                : 'Sellers must publish accurate information, honor their commitments, process reservations within the required deadlines, ship orders according to the defined conditions and provide a product matching their listing.'}
            </p>
          </div>
        </div>

        {/* SECURITY */}
        <section className="section">
          <h2>
            🔐{' '}
            {fr
              ? 'Sécurité et bonnes pratiques'
              : 'Security and best practices'}
          </h2>

          <p>
            {fr
              ? "Ne partage jamais ton mot de passe, tes codes de validation ou les informations sensibles de ton compte. Promo's World ne te demandera pas de transmettre ces informations à un tiers."
              : "Never share your password, verification codes or sensitive account information. Promo's World will not ask you to provide these details to a third party."}
          </p>

          <p>
            {fr
              ? "Pour les transactions, utilise uniquement les fonctionnalités disponibles directement dans la plateforme et vérifie toujours les informations avant de confirmer une opération."
              : 'For transactions, use only the features available directly on the platform and always verify the information before confirming an operation.'}
          </p>
        </section>

        {/* FINAL */}
        <div className="final-message">
          {fr
            ? "Promo's World a pour objectif de créer un environnement simple, transparent et structuré pour les promotions et les transactions entre clients et vendeurs."
            : "Promo's World aims to create a simple, transparent and structured environment for promotions and transactions between customers and sellers."}

          <br />

          <button
            className="home-button"
            onClick={() => router.push('/')}
          >
            {fr
              ? 'Découvrir les promotions'
              : 'Discover promotions'}
          </button>
        </div>

        <footer className="footer">
          Promo's World ·{' '}
          {fr
            ? 'Marketplace de promotions'
            : 'Promotions marketplace'}
        </footer>
      </main>
    </div>
  )
}