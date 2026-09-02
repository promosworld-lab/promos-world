'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Globe2,
  ShieldCheck,
  ShoppingBag,
  Users,
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: ShoppingBag,
      title: 'Simplicité',
      description:
        'Une plateforme facile à comprendre et agréable à utiliser sur tous les écrans.',
    },
    {
      icon: ShieldCheck,
      title: 'Confiance',
      description:
        'Un parcours structuré pour mieux suivre les achats, réservations et transactions.',
    },
    {
      icon: Users,
      title: 'Accessibilité',
      description:
        'Une expérience pensée pour les utilisateurs et vendeurs, partout et sur tous les appareils.',
    },
    {
      icon: Globe2,
      title: 'Ouverture',
      description:
        'Une plateforme moderne pensée pour évoluer progressivement vers une expérience internationale.',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_40%)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <div className="mx-auto inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
            À propos de Promo&apos;s World
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black sm:text-5xl lg:text-6xl">
            Une nouvelle manière de découvrir
            <span className="block text-orange-500">les bonnes opportunités.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            Promo&apos;s World est une plateforme conçue pour faciliter la découverte
            de promotions, les réservations, les échanges entre utilisateurs et le
            suivi des transactions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              Notre vision
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Rendre les promotions plus simples à découvrir et à utiliser.
            </h2>

            <p className="mt-6 leading-7 text-zinc-400">
              Nous voulons proposer une expérience moderne où les utilisateurs
              peuvent trouver des offres intéressantes, communiquer avec les
              vendeurs et suivre leurs opérations sans se perdre dans des
              processus compliqués.
            </p>

            <p className="mt-4 leading-7 text-zinc-400">
              La plateforme évolue progressivement afin d&apos;offrir une expérience
              toujours plus fiable, intuitive et adaptée aux usages modernes.
            </p>

            <Link
              href="/promo"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-black"
            >
              Découvrir les promotions <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-orange-500/10 p-4 text-orange-500">
                <BadgeCheck size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Une plateforme en évolution</h3>
                <p className="text-sm text-zinc-500">
                  Construite pour grandir progressivement.
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5">
              {[
                'Découverte de promotions',
                'Achats et réservations',
                'Portefeuille et suivi des opérations',
                'Messagerie entre utilisateurs',
                'Gestion des avis et litiges',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-zinc-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-black p-6"
              >
                <Icon className="text-orange-500" size={26} />
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}