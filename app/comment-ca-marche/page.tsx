"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, ShieldCheck, Wallet, ShoppingBag, Scale, Star, Megaphone } from "lucide-react";

const sections = [
  { icon: Wallet, title: "Votre portefeuille", text: "Votre portefeuille Promo's World est la source de tous vos paiements internes. Vous pouvez l'alimenter ou demander un retrait via les moyens de paiement disponibles dans votre pays. Les achats, réservations et services payants de la plateforme utilisent ensuite ce solde." },
  { icon: ShoppingBag, title: "Achat direct", text: "Lors d'un achat, le montant est bloqué dans votre portefeuille. Il n'est versé au vendeur qu'après la livraison et votre confirmation. La commission de 2 % de Promo's World est prélevée uniquement lorsque la transaction est finalisée." },
  { icon: Clock3, title: "Réservation à 20 %", text: "Une réservation bloque 20 % du prix de l'article. Le vendeur dispose de 36 heures pour accepter ou refuser. En cas de refus, l'acompte est restitué au client. Après acceptation, le client dispose de 3 mois pour payer le solde." },
  { icon: ShieldCheck, title: "Livraison et protection", text: "Après paiement intégral, le vendeur dispose de 48 heures pour expédier. Le client peut accorder une extension facultative de 36 heures. Après réception, le client dispose de 48 heures pour vérifier la commande avant la libération des fonds." },
  { icon: Scale, title: "Expiration et litige", text: "Si le solde n'est pas payé dans les 3 mois, la réservation expire. L'acompte est alors réparti à hauteur de 50 % pour le client, 25 % pour le vendeur et 25 % pour Promo's World. En cas de problème, un litige peut être ouvert et les fonds restent protégés pendant l'examen." },
  { icon: Star, title: "Avis", text: "Les avis servent à partager une expérience réelle après une transaction finalisée. Ils contribuent à la confiance entre acheteurs et vendeurs." },
  { icon: Megaphone, title: "Publications sponsorisées", text: "Les vendeurs peuvent utiliser leur portefeuille pour promouvoir leurs publications. Les campagnes sont soumises aux règles et à la validation de Promo's World selon l'emplacement choisi." },
];

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"><ArrowLeft size={16} /> Retour</Link>
        <header className="mt-10 max-w-3xl">
          <p className="font-bold uppercase tracking-widest text-orange-500">Promo's World</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Comprendre la plateforme avant d'utiliser votre argent</h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">Nous voulons que chaque utilisateur connaisse les règles avant d'acheter, réserver, vendre ou utiliser un service payant. Voici le fonctionnement essentiel de Promo's World.</p>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map(({ icon: Icon, title, text }) => (
            <section key={title} className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
              <Icon className="text-orange-500" size={24} />
              <h2 className="mt-4 text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6">
          <h2 className="text-xl font-black">À retenir</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-200">
            <li>• Les opérations financières internes utilisent votre portefeuille Promo's World.</li>
            <li>• Les fonds engagés dans une transaction restent bloqués jusqu'à son issue conforme.</li>
            <li>• La commission de 2 % n'est prélevée qu'à la finalisation réussie de la transaction.</li>
            <li>• Les délais de 36 h, 3 mois et 48 h sont des éléments essentiels du processus.</li>
            <li>• En cas de désaccord, utilisez le système de litige plutôt que de contourner la procédure.</li>
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/promo" className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Découvrir le marketplace</Link>
          <Link href="/wallet" className="rounded-xl border border-white/10 px-5 py-3 font-bold">Voir mon portefeuille</Link>
        </div>
      </div>
    </main>
  );
}
