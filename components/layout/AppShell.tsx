"use client";

import { ReactNode } from "react";

import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="min-h-[calc(100vh-64px)] pb-24 md:pb-8">
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
}