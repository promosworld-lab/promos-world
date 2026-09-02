"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    promotions: 0,
    transactions: 0,
    litiges: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      const [users, promotions, transactions, litiges] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("promotions")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("transactions")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("litiges")
            .select("*", { count: "exact", head: true })
            .eq("statut", "ouvert"),
        ]);

      setStats({
        users: users.count || 0,
        promotions: promotions.count || 0,
        transactions: transactions.count || 0,
        litiges: litiges.count || 0,
      });

      setLoading(false);
    };

    loadAdmin();
  }, [router]);

  if (loading) return <Loading />;

  const cards = [
    {
      label: "Utilisateurs",
      value: stats.users,
      icon: "👥",
    },
    {
      label: "Promotions",
      value: stats.promotions,
      icon: "🏷️",
    },
    {
      label: "Transactions",
      value: stats.transactions,
      icon: "💳",
      href: "/admin/transactions",
    },
    {
      label: "Litiges ouverts",
      value: stats.litiges,
      icon: "⚠️",
      href: "/admin/litiges",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-2">
          Administration
        </h1>

        <p className="text-zinc-400 mb-8">
          Centre de contrôle Promo's World
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card
              key={card.label}
              className="cursor-pointer hover:border-orange-500 transition"
              onClick={() => card.href && router.push(card.href)}
            >
              <div className="text-3xl">{card.icon}</div>

              <p className="text-zinc-400 mt-4 text-sm">
                {card.label}
              </p>

              <p className="text-3xl font-bold mt-2">
                {card.value}
              </p>
            </Card>
          ))}
        </div>

      </div>
    </main>
  );
}