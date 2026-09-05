'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Store, Package, ShoppingBag, CalendarClock, WalletCards, AlertTriangle, ShieldCheck, Star, BarChart3, Settings, ArrowLeft, Headphones } from 'lucide-react';

const sections = [
  { href: '/admin', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/vendeurs', label: 'Vendeurs', icon: Store },
  { href: '/admin/publications', label: 'Publications', icon: Package },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarClock },
  { href: '/admin/transactions', label: 'Transactions', icon: WalletCards },
  { href: '/admin/litiges', label: 'Litiges', icon: AlertTriangle },
  { href: '/admin/kyc', label: 'KYC', icon: ShieldCheck },
  { href: '/admin/avis', label: 'Avis', icon: Star },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-zinc-950 lg:block">
        <div className="flex h-full flex-col p-4">
          <div className="mb-5 px-3 pt-2">
            <p className="text-xs font-black tracking-[0.2em] text-orange-500">PROMO’S WORLD</p>
            <h1 className="mt-1 text-xl font-black">Admin Center</h1>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sections.map(({ href, label, icon: Icon }) => {
              const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
              return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-orange-500 text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}><Icon size={17}/>{label}</Link>;
            })}
          </nav>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-400 hover:bg-white/5 hover:text-white"><ArrowLeft size={17}/>Retour au site</Link>
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="border-b border-white/10 bg-zinc-950/90 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="shrink-0 text-xs font-black text-orange-500">ADMIN</span>
            {sections.slice(0, 8).map(({ href, label }) => <Link key={href} href={href} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${pathname === href ? 'bg-orange-500 text-black' : 'bg-white/5 text-zinc-400'}`}>{label}</Link>)}
          </div>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
