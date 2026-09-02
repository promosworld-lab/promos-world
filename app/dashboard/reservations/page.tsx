"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import Card from "@/components/ui/Card";

export default function DashboardReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: promotions } = await supabase
        .from("promotions")
        .select("id")
        .eq("vendeur_id", user.id);

      const ids = promotions?.map((p) => p.id) || [];

      if (!ids.length) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("reservations")
        .select(`
          *,
          promotions (*)
        `)
        .in("promotion_id", ids)
        .order("created_at", { ascending: false });

      setReservations(data || []);
      setLoading(false);
    };

    loadReservations();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Réservations reçues
        </h1>

        {reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation"
            message="Les réservations de vos promotions apparaîtront ici."
          />
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                  <div>
                    <h2 className="font-bold text-lg">
                      {reservation.promotions?.titre || "Promotion"}
                    </h2>

                    <p className="text-sm text-zinc-400 mt-1">
                      {new Date(
                        reservation.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">Acompte</p>
                      <p className="font-semibold text-orange-500">
                        {Number(
                          reservation.montant_acompte
                        ).toLocaleString()}{" "}
                        FCFA
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-500">Statut</p>
                      <p>{reservation.statut}</p>
                    </div>
                  </div>

                </div>

              </Card>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}