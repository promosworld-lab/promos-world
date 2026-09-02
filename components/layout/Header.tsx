"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Tag,
  Wallet,
  User,
  MessageCircle,
  Shield,
  LogOut,
  Globe,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    user,
    profile,
    loading,
    isAdmin,
    isVendeur,
    signOut,
  } = useAuth();

  const { language, toggleLanguage } = useLanguage();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const navigation = [
    {
      label: language === "fr" ? "Accueil" : "Home",
      href: "/",
      icon: Home,
    },
    {
      label: language === "fr" ? "Promotions" : "Deals",
      href: "/promo",
      icon: Tag,
    },
    {
      label: language === "fr" ? "Messages" : "Messages",
      href: "/messages",
      icon: MessageCircle,
      auth: true,
    },
  ];

  if (isVendeur) {
    navigation.push({
      label: language === "fr" ? "Dashboard" : "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      auth: true,
    });
  }

  if (isAdmin) {
    navigation.push({
      label: language === "fr" ? "Administration" : "Admin",
      href: "/admin",
      icon: Shield,
      auth: true,
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-black">
            P
          </div>

          <span className="hidden text-lg font-bold text-white sm:block">
            Promo's World
          </span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            if (item.auth && !user) return null;

            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition
                  ${
                    active
                      ? "bg-orange-500 text-black"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">

          {/* LANGUAGE */}
          <button
            onClick={toggleLanguage}
            className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            aria-label="Changer la langue"
          >
            <Globe size={18} />
            <span className="uppercase">{language}</span>
          </button>

          {!loading && !user && (
            <Link
              href="/auth"
              className="hidden rounded-xl bg-orange-500 px-4 py-2 font-semibold text-black transition hover:bg-orange-400 sm:block"
            >
              {language === "fr" ? "Connexion" : "Sign in"}
            </Link>
          )}

          {!loading && user && (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-bold text-orange-500 hover:bg-zinc-700"
              >
                {(profile?.nom || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl">

                  <div className="border-b border-white/10 px-3 py-3">
                    <p className="truncate font-semibold text-white">
                      {profile?.nom || "Utilisateur"}
                    </p>

                    <p className="truncate text-xs text-zinc-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/profil"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    <User size={18} />
                    {language === "fr" ? "Mon profil" : "My profile"}
                  </Link>

                  <Link
                    href="/wallet"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                  >
                    <Wallet size={18} />
                    Wallet
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    {language === "fr" ? "Déconnexion" : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MENU MOBILE */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10 md:hidden"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-zinc-950 p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => {
              if (item.auth && !user) return null;

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}

            {!user && (
              <Link
                href="/auth"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-xl bg-orange-500 px-4 py-3 text-center font-bold text-black"
              >
                {language === "fr" ? "Connexion" : "Sign in"}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}