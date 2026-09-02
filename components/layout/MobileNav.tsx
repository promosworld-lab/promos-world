"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
const pathname = usePathname();

const { user } = useAuth();
const { t } = useLanguage();

const links = [
{
href: "/",
label: t("nav.home"),
icon: "⌂",
},
{
href: "/promo",
label: t("nav.promotions"),
icon: "🔥",
},
{
href: user ? "/messages" : "/auth",
label: t("nav.messages"),
icon: "💬",
},
{
href: user ? "/dashboard" : "/auth",
label: t("common.dashboard"),
icon: "▦",
},
{
href: user ? "/profil" : "/auth",
label: t("nav.profile"),
icon: "👤",
},
];

return (
<nav className="mobile-nav">
{links.map((link) => (
<Link
key={link.label}
href={link.href}
className={
pathname === link.href
? "mobile-nav-item active"
: "mobile-nav-item"
}
>
<span className="mobile-nav-icon">
{link.icon}
</span>

      <span className="mobile-nav-label">
        {link.label}
      </span>
    </Link>
  ))}
</nav>

);
}