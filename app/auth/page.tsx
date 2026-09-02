'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.replace('/dashboard');
        return;
      }

      await signUp({
        nom,
        email,
        password,
      });

      setMessage(
        'Compte créé avec succès. Vérifiez votre email si une confirmation est demandée.'
      );

      setMode('login');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_35%)]" />

        <Link
          href="/"
          className="relative inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft size={18} />
          Retour à l&apos;accueil
        </Link>

        <div className="relative max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
            Promo&apos;s World
          </div>

          <h1 className="text-5xl font-black leading-tight">
            Découvrez.
            <br />
            Réservez.
            <br />
            <span className="text-orange-500">Profitez.</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Une expérience moderne pour découvrir des promotions et gérer vos
            opérations simplement.
          </p>
        </div>

        <p className="relative text-sm text-zinc-600">
          © {new Date().getFullYear()} Promo&apos;s World
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-400 lg:hidden"
          >
            <ArrowLeft size={18} />
            Accueil
          </Link>

          <div>
            <h2 className="text-3xl font-black">
              {mode === 'login' ? 'Bienvenue 👋' : 'Créer un compte'}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              {mode === 'login'
                ? 'Connectez-vous pour continuer.'
                : 'Rejoignez Promo’s World en quelques secondes.'}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 rounded-xl border border-white/10 bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setMessage('');
              }}
              className={`rounded-lg py-2.5 text-sm font-bold transition ${
                mode === 'login'
                  ? 'bg-orange-500 text-black'
                  : 'text-zinc-400'
              }`}
            >
              Connexion
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setMessage('');
              }}
              className={`rounded-lg py-2.5 text-sm font-bold transition ${
                mode === 'register'
                  ? 'bg-orange-500 text-black'
                  : 'text-zinc-400'
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Nom
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4">
                  <User size={19} className="text-zinc-500" />
                  <input
                    value={nom}
                    onChange={(event) => setNom(event.target.value)}
                    required
                    placeholder="Votre nom"
                    className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4">
                <Mail size={19} className="text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="vous@email.com"
                  className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Mot de passe
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4">
                <Lock size={19} className="text-zinc-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimum 6 caractères"
                  className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-zinc-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {message && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={19} />}
              {loading
                ? 'Veuillez patienter...'
                : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}