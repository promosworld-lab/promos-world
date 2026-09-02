"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";

export default function AcheterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [promotion, setPromotion] = useState<any>(null);
  const [vendeur, setVendeur] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadPromotion = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setPromotion(data);

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.vendeur_id)
          .single();

        setVendeur(profile);
      }

      setLoading(false);
    };

    loadPromotion();
  }, [id]);

  if (loading) return <Loading />;

  if (!promotion) {
    return (
      <ErrorState
        title="Promotion introuvable"
        message="Cette promotion n'existe plus ou a été supprimée."
      />
    );
  }

  const reduction =
    promotion.prix_original > 0
      ? Math.round(
          ((promotion.prix_original - promotion.prix_promo) /
            promotion.prix_original) *
            100
        )
      : 0;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">

        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          <Card className="overflow-hidden">
            {promotion.photo_url ? (
              <img
                src={promotion.photo_url}
                alt={promotion.titre}
                className="w-full aspect-square object-cover"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-6xl bg-zinc-900">
                📦
              </div>
            )}
          </Card>

          <div className="space-y-6">

            <div>
              <span className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm mb-4">
                {promotion.categorie}
              </span>

              <h1 className="text-3xl md:text-5xl font-bold">
                {promotion.titre}
              </h1>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-3xl md:text-4xl font-bold text-orange-500">
                {Number(promotion.prix_promo).toLocaleString()} FCFA
              </span>

              {promotion.prix_original > promotion.prix_promo && (
                <span className="text-zinc-500 line-through mb-1">
                  {Number(promotion.prix_original).toLocaleString()} FCFA
                </span>
              )}
            </div>

            {reduction > 0 && (
              <div className="text-green-400 font-semibold">
                🔥 Économisez {reduction}%
              </div>
            )}

            <Card className="space-y-3">
              <h2 className="font-bold text-lg">Description</h2>
              <p className="text-zinc-300 whitespace-pre-line">
                {promotion.description || "Aucune description disponible."}
              </p>
            </Card>

            <Card className="space-y-2">
              <h2 className="font-bold">📍 Localisation</h2>

              <p className="text-zinc-300">
                {[promotion.ville, promotion.pays]
                  .filter(Boolean)
                  .join(", ") || "Non précisée"}
              </p>

              {promotion.delai_livraison_jours && (
                <p className="text-zinc-300">
                  🚚 Livraison estimée :{" "}
                  {promotion.delai_livraison_jours} jour(s)
                </p>
              )}
            </Card>

            <Card>
              <h2 className="font-bold mb-2">👤 Vendeur</h2>

              <p className="text-zinc-300">
                {vendeur?.nom || "Vendeur Promo's World"}
              </p>

              {vendeur?.telephone && (
                <p className="text-sm text-zinc-500 mt-1">
                  {vendeur.telephone}
                </p>
              )}
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1"
                onClick={() => router.push(`/reserver/${promotion.id}`)}
              >
                Réserver maintenant
              </Button>

              <Button
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  router.push(`/chat/${promotion.vendeur_id}`)
                }
              >
                💬 Contacter le vendeur
              </Button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}