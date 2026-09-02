"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";

export default function ReserverPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single();

      setPromotion(data);
      setLoading(false);
    };

    load();
  }, [id, router]);

  const handleReservation = async () => {
    if (!user || !promotion) return;

    setProcessing(true);

    try {
      const montantAcompte = Math.round(Number(promotion.prix_promo) * 0.3);
      const montantRestant =
        Number(promotion.prix_promo) - montantAcompte;

      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 2);

      const { data: reservation, error } = await supabase
        .from("reservations")
        .insert({
          client_id: user.id,
          promotion_id: promotion.id,
          montant_acompte: montantAcompte,
          montant_restant: montantRestant,
          methode_paiement: "simulation",
          statut: "acompte_paye",
          date_expiration: expiration.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("transactions").insert({
        type: "reservation",
        client_id: user.id,
        vendeur_id: promotion.vendeur_id,
        promotion_id: promotion.id,
        reservation_id: reservation.id,
        montant_total: promotion.prix_promo,
        montant_paye: montantAcompte,
        commission_plateforme: 0,
        methode_paiement: "simulation",
        statut: "bloque",
      });

      alert("✅ Réservation effectuée avec succès !");
      router.push("/reservations");
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;

  if (!promotion) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Promotion introuvable.
      </main>
    );
  }

  const acompte = Math.round(Number(promotion.prix_promo) * 0.3);
  const restant = Number(promotion.prix_promo) - acompte;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Confirmer la réservation
        </h1>

        <Card className="space-y-6">

          <div className="flex gap-4">
            {promotion.photo_url && (
              <img
                src={promotion.photo_url}
                alt={promotion.titre}
                className="w-24 h-24 object-cover rounded-xl"
              />
            )}

            <div>
              <h2 className="font-bold text-xl">{promotion.titre}</h2>
              <p className="text-orange-500 font-bold mt-2">
                {Number(promotion.prix_promo).toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-5 space-y-4">

            <div className="flex justify-between">
              <span className="text-zinc-400">Prix total</span>
              <span>
                {Number(promotion.prix_promo).toLocaleString()} FCFA
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">
                Acompte à payer (simulation)
              </span>

              <span className="text-orange-500 font-bold">
                {acompte.toLocaleString()} FCFA
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-400">Solde restant</span>

              <span>{restant.toLocaleString()} FCFA</span>
            </div>

          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-zinc-300">
            🧪 Le paiement est actuellement en mode simulation pour la
            phase de test de Promo's World.
          </div>

          <Button
            className="w-full"
            loading={processing}
            onClick={handleReservation}
          >
            Confirmer la réservation
          </Button>

        </Card>
      </div>
    </main>
  );
}