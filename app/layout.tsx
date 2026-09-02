import type { Metadata } from "next";
import "./globals.css";

import { ToastProvider } from "@/components/providers/ToastProvider";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
title: {
default: "Promo's World",
template: "%s | Promo's World",
},

description:
"Découvrez les meilleures promotions et offres avec Promo's World.",

keywords: [
"promotions",
"bons plans",
"shopping",
"Promo's World",
],

applicationName: "Promo's World",

icons: {
icon: "/favicon.ico",
},
};

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode;
}>) {
return (
<html lang="fr" suppressHydrationWarning>
<body className="bg-black text-white antialiased">
<LanguageProvider>
<AuthProvider>
<ToastProvider>
<AppShell>
{children}
</AppShell>
</ToastProvider>
</AuthProvider>
</LanguageProvider>
</body>
</html>
);
}