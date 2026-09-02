'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Wallet,
} from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Trouvez les meilleures offres',
    description:
      'Découvrez rapidement des promotions intéressantes proposées par des vendeurs.',
  },
  {
    icon: ShieldCheck,
    title: 'Achetez avec confiance',
    description:
      'Un parcours clair pour acheter, réserver, suivre et confirmer vos transactions.',
  },
  {
    icon: Wallet,
    title: 'Gardez le contrôle',
    description:
      'Suivez votre portefeuille, vos mouvements et vos transactions depuis un seul espace.',
  },
  {
    icon: MessageCircle,
    title: 'Communiquez facilement',
    description:
      'Échangez directement avec les vendeurs avant et pendant votre expérience.',
  },
];

const steps = [
  ['01', 'Découvrez', 'Parcourez les promotions disponibles.'],
  ['02', 'Choisissez', 'Achetez directement ou réservez une offre.'],
  ['03', 'Suivez', 'Gardez un œil sur chaque étape de votre transaction.'],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_left,rgba(249,115,22,0.10),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
              <Sparkles size={16} />
              Promotions • Réservations • Transactions
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Les bonnes offres,
              <span className="block text-orange-500">en toute simplicité.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              Promo&apos;s World vous permet de découvrir des offres, réserver des
              produits et suivre vos transactions dans une expérience moderne et
              intuitive.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/promo"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-black transition hover:bg-orange-400"
              >
                <ShoppingBag size={19} />
                Découvrir les promotions
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition hover:bg-white/5"
              >
                Créer un compte
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-zinc-400">
              <span className="flex items-center gap-2">
                <BadgeCheck className="text-orange-500" size={18} />
                Parcours simplifié
              </span>
              <span className="flex items-center gap-2">
                <Star className="text-orange-500" size={18} />
                Avis utilisateurs
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-orange-950/20 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Promo&apos;s World</p>
                  <h2 className="text-xl font-bold">Tout au même endroit</h2>
                </div>
                <div className="rounded-2xl bg-orange-500/15 p-3 text-orange-500">
                  <ShoppingBag size={25} />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ['🔥', 'Promotions', 'Découvrez les meilleures opportunités'],
                  ['💳', 'Transactions', 'Suivez vos paiements'],
                  ['📦', 'Réservations', 'Gardez vos offres de côté'],
                  ['💬', 'Messages', 'Échangez avec les vendeurs'],
                ].map(([emoji, title, description]) => (
                  <div
                    key={title}
                    className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                  >
                    <div className="text-2xl">{emoji}</div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-zinc-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
            Une expérience complète
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Pensée pour être simple à utiliser.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-zinc-950 p-6 transition hover:-translate-y-1 hover:border-orange-500/30"
            >
              <div className="mb-5 inline-flex rounded-xl bg-orange-500/10 p-3 text-orange-500">
                <Icon size={23} />
              </div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-black">
            Comment ça fonctionne ?
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/10 bg-black p-6"
              >
                <span className="text-4xl font-black text-orange-500/70">
                  {number}
                </span>
                <h3 className="mt-6 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 to-transparent p-8 sm:p-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Prêt à découvrir les offres ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Rejoignez Promo&apos;s World et profitez d&apos;une expérience moderne
            pour découvrir, acheter et réserver.
          </p>

          <Link
            href="/promo"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3.5 font-bold text-black transition hover:bg-orange-400"
          >
            Commencer maintenant <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}