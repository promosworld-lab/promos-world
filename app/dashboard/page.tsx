"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    promotions: 0,
    reservations: 0,
    ventes: 0,
    revenus: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const [promotionsRes, reservationsRes, transactionsRes] =
        await Promise.all([
          supabase
            .from("promotions")
            .select("*", { count: "exact", head: true })
            .eq("vendeur_id", user.id),

          supabase
            .from("reservations")
            .select("id,promotion_id"),

          supabase
            .from("transactions")
            .select("montant_total,montant_paye")
            .eq("vendeur_id", user.id),
        ]);

      const revenus =
        transactionsRes.data?.reduce(
          (sum, item) => sum + Number(item.montant_paye || 0),
          0
        ) || 0;

      setStats({
        promotions: promotionsRes.count || 0,
        reservations: reservationsRes.data?.length || 0,
        ventes: transactionsRes.data?.length || 0,
        revenus,
      });

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  if (loading) return <Loading />;

  const cards = [
    {
      label: "Mes promotions",
      value: stats.promotions,
      icon: "🏷️",
      href: "/promo",
    },
    {
      label: "Réservations",
      value: stats.reservations,
      icon: "📦",
      href: "/dashboard/reservations",
    },
    {
      label: "Transactions",
      value: stats.ventes,
      icon: "💳",
      href: "/transactions",
    },
    {
      label: "Montant encaissé",
      value: `${stats.revenus.toLocaleString()} FCFA`,
      icon: "💰",
      href: "/wallet",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-2">
            Gérez votre activité sur Promo's World.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card
              key={card.label}
              className="cursor-pointer hover:border-orange-500 transition"
              onClick={() => router.push(card.href)}
            >
              <div className="text-3xl mb-3">{card.icon}</div>

              <div className="text-zinc-400 text-sm">
                {card.label}
              </div>

              <div className="text-xl md:text-2xl font-bold mt-2">
                {card.value}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <h2 className="text-xl font-bold mb-4">Actions rapides</h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.push("/promo")}>
              ➕ Créer une promotion
            </Button>

            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/reservations")}
            >
              📦 Voir les réservations
            </Button>
          </div>
        </Card>

      </div>
    </main>
  );
}