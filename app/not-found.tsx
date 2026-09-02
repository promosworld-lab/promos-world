'use client';

import Link from 'next/link';
import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-500/10 text-orange-500">
          <SearchX size={38} />
        </div>

        <p className="mt-8 text-7xl font-black text-orange-500 sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-black sm:text-3xl">
          Page introuvable
        </h1>

        <p className="mt-4 leading-7 text-zinc-500">
          La page que vous recherchez n&apos;existe pas, a été déplacée ou n&apos;est
          plus disponible.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-black"
          >
            <Home size={18} />
            Retour à l&apos;accueil
          </Link>

          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3.5 font-semibold text-zinc-300 transition hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </div>
      </div>
    </main>
  );
}