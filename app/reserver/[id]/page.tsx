"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import { supabase } from "@/lib/supabase/client";
import { reservationsService } from "@/lib/services/reservations.service";
import type { Promotion } from "@/types/database";

export default function ReserverPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (active) setError(authError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        router.replace(`/auth?redirectTo=/reserver/${id}`);
        return;
      }
      const { data: publication, error: publicationError } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single();
      if (!active) return;
      if (publicationError) setError(publicationError.message);
      else setPromotion(publication as Promotion);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [id, router]);

  async function handleReservation() {
    if (!promotion || processing) return;
    setProcessing(true);
    setError(null);
    try {
      const reservation = await reservationsService.createFromWallet(promotion.id);
      alert("Réservation créée : 20 % ont été bloqués dans votre portefeuille.");
      router.push(`/reservations?reservation=${reservation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer la réservation.");
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Loading />;
  if (!promotion) return <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">{error ?? "Publication introuvable."}</main>;

  const total = Number(promotion.prix_promo);
  const acompte = Math.round(total * 0.2);
  const restant = total - acompte;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Confirmer la réservation</h1>
        <Card className="space-y-6">
          <div className="flex gap-4">
            {promotion.photo_url && <img src={promotion.photo_url} alt={promotion.titre} className="w-24 h-24 object-cover rounded-xl" />}
            <div>
              <h2 className="font-bold text-xl">{promotion.titre}</h2>
              <p className="text-orange-500 font-bold mt-2">{total.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="border-t border-zinc-800 pt-5 space-y-4">
            <div className="flex justify-between"><span className="text-zinc-400">Prix total</span><span>{total.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Acompte (20 %)</span><span className="text-orange-500 font-bold">{acompte.toLocaleString()} FCFA</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Solde restant</span><span>{restant.toLocaleString()} FCFA</span></div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-sm text-zinc-300 space-y-2">
            <p><strong>Votre acompte sera prélevé de votre portefeuille et bloqué.</strong> Il ne sera pas versé immédiatement au vendeur.</p>
            <p>Le vendeur dispose de 36 h pour accepter ou refuser. Après acceptation, vous avez 3 mois pour payer le solde.</p>
            <p>Aucune commission de 2 % n'est prélevée maintenant : elle intervient uniquement lorsque la transaction est finalisée.</p>
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <Button className="w-full" loading={processing} onClick={handleReservation}>Bloquer l'acompte et réserver</Button>
        </Card>
      </div>
    </main>
  );
}