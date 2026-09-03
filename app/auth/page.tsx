'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, User, MapPin, Store, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const countries = ['Bénin', 'Nigeria', 'Togo', 'Ghana', 'Côte d’Ivoire', 'Autre'];

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'vendeur'>('client');
  const [pays, setPays] = useState('Bénin');
  const [ville, setVille] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
        router.replace('/dashboard');
        return;
      }

      await signUp({
        nom: nom.trim(),
        email: email.trim(),
        password,
        role,
        pays,
        ville: ville.trim(),
      });

      setMessage('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
      setMode('login');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.20),transparent_35%)]" />
        <Link href="/" className="relative inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400"><ArrowLeft size={18}/> Retour à l’accueil</Link>
        <div className="relative max-w-xl">
          <div className="mb-6 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">PROMO’S WORLD</div>
          <h1 className="text-5xl font-black leading-tight">Découvrez.<br/>Achetez.<br/><span className="text-orange-500">Vendez.</span></h1>
          <p className="mt-6 text-lg leading-8 text-zinc-400">Une marketplace moderne pour publier des articles, créer des promotions et acheter avec plus de confiance.</p>
        </div>
        <p className="relative text-sm text-zinc-600">© {new Date().getFullYear()} Promo’s World</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 lg:hidden"><ArrowLeft size={18}/> Accueil</Link>
          <h2 className="text-3xl font-black">{mode === 'login' ? 'Bienvenue 👋' : 'Créer un compte'}</h2>
          <p className="mt-2 text-sm text-zinc-500">{mode === 'login' ? 'Connectez-vous pour continuer.' : 'Choisissez votre profil et votre localisation.'}</p>

          <div className="mt-8 grid grid-cols-2 rounded-xl border border-white/10 bg-zinc-950 p-1">
            {(['login','register'] as const).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setMessage(''); }} className={`rounded-lg py-2.5 text-sm font-bold transition ${mode === item ? 'bg-orange-500 text-black' : 'text-zinc-400'}`}>{item === 'login' ? 'Connexion' : 'Inscription'}</button>)}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'register' && <>
              <Field label="Nom complet" icon={<User size={19}/>}><input value={nom} onChange={(e)=>setNom(e.target.value)} required placeholder="Votre nom" className="auth-input"/></Field>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Je souhaite utiliser Promo’s World comme</label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleButton active={role==='client'} onClick={()=>setRole('client')} icon={<Users size={20}/>} title="Client" text="Acheter et réserver"/>
                  <RoleButton active={role==='vendeur'} onClick={()=>setRole('vendeur')} icon={<Store size={20}/>} title="Vendeur" text="Publier et vendre"/>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Pays" icon={<MapPin size={19}/>}><select value={pays} onChange={(e)=>setPays(e.target.value)} className="auth-input"><option>{countries[0]}</option>{countries.slice(1).map(c=><option key={c}>{c}</option>)}</select></Field>
                <Field label="Ville" icon={<MapPin size={19}/>}><input value={ville} onChange={(e)=>setVille(e.target.value)} required placeholder="Votre ville" className="auth-input"/></Field>
              </div>
            </>}

            <Field label="Email" icon={<Mail size={19}/>}><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="vous@email.com" className="auth-input"/></Field>
            <Field label="Mot de passe" icon={<Lock size={19}/>} right={<button type="button" onClick={()=>setShowPassword(!showPassword)} className="text-zinc-500 hover:text-white">{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button>}><input type={showPassword?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={6} placeholder="Minimum 6 caractères" className="auth-input"/></Field>

            {message && <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-200">{message}</div>}
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black transition hover:bg-orange-400 disabled:opacity-60">{loading && <Loader2 className="animate-spin" size={19}/>} {loading ? 'Veuillez patienter...' : mode==='login' ? 'Se connecter' : 'Créer mon compte'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({label, icon, right, children}:{label:string;icon:React.ReactNode;right?:React.ReactNode;children:React.ReactNode}) {
  return <div><label className="mb-2 block text-sm font-medium text-zinc-300">{label}</label><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 text-zinc-500">{icon}{children}{right}</div></div>;
}
function RoleButton({active,onClick,icon,title,text}:{active:boolean;onClick:()=>void;icon:React.ReactNode;title:string;text:string}) {
 return <button type="button" onClick={onClick} className={`rounded-xl border p-4 text-left transition ${active?'border-orange-500 bg-orange-500/10':'border-white/10 bg-zinc-950 hover:border-white/30'}`}><div className={active?'text-orange-400':'text-zinc-400'}>{icon}</div><p className="mt-2 font-bold">{title}</p><p className="text-xs text-zinc-500">{text}</p></button>;
}