"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import EmptyState from "@/components/common/EmptyState";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ReservationsPage() {
  const router = useRouter();

  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("reservations")
        .select(`
          *,
          promotions (*)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      setReservations(data || []);
      setLoading(false);
    };

    loadReservations();
  }, [router]);

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Mes réservations
        </h1>

        {reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation"
            message="Vous n'avez encore réservé aucune promotion."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {reservations.map((reservation) => (
              <Card key={reservation.id}>

                {reservation.promotions?.photo_url && (
                  <img
                    src={reservation.promotions.photo_url}
                    alt={reservation.promotions.titre}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}

                <h2 className="text-lg font-bold">
                  {reservation.promotions?.titre}
                </h2>

                <div className="mt-4 space-y-2 text-sm">
                  <p>
                    <span className="text-zinc-500">Acompte :</span>{" "}
                    {Number(
                      reservation.montant_acompte
                    ).toLocaleString()}{" "}
                    FCFA
                  </p>

                  <p>
                    <span className="text-zinc-500">Restant :</span>{" "}
                    {Number(
                      reservation.montant_restant
                    ).toLocaleString()}{" "}
                    FCFA
                  </p>

                  <p className="text-orange-400">
                    {reservation.statut}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="w-full mt-5"
                  onClick={() =>
                    router.push(`/acheter/${reservation.promotion_id}`)
                  }
                >
                  Voir la promotion
                </Button>

              </Card>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}