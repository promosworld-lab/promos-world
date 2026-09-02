"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Tag,
  Wallet,
  MessageCircle,
  User,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
    {
      href: "/",
      label: "Accueil",
      icon: Home,
    },
    {
      href: "/promo",
      label: "Promos",
      icon: Tag,
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: Wallet,
      auth: true,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      auth: true,
    },
    {
      href: "/profil",
      label: "Profil",
      icon: User,
      auth: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {items.map((item) => {
          if (item.auth && !user) return null;

          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs transition
                ${
                  active
                    ? "text-orange-500"
                    : "text-zinc-500 hover:text-white"
                }
              `}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 2} />

              <span className="max-w-[70px] truncate">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}