"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { promotionsService } from "@/lib/services/promotions.service";
import { transactionsService } from "@/lib/services/transactions.service";
import { supabase } from "@/lib/supabase/client";
import type { Profile, Promotion } from "@/types/database";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";

export default function AcheterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [vendeur, setVendeur] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      setLoading(true);
      try {
        const item = await promotionsService.getById(id);
        setPromotion(item);
        if (item) {
          const { data } = await supabase.from("profiles").select("*").eq("id", item.vendeur_id).maybeSingle();
          setVendeur(data as Profile | null);
        }
      } catch (err) { setError(err instanceof Error ? err.message : "Impossible de charger la publication."); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const buy = async () => {
    if (!promotion || buying) return;
    setBuying(true); setError(null);
    try {
      const transactionId = await transactionsService.createDirectPurchase(promotion.id);
      router.push(`/transactions/${transactionId}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Achat impossible. Vérifiez votre solde disponible."); }
    finally { setBuying(false); }
  };

  if (loading) return <Loading />;
  if (error && !promotion) return <ErrorState title="Impossible de charger" message={error} />;
  if (!promotion) return <ErrorState title="Publication introuvable" message="Cette publication n'existe plus ou n'est plus disponible." />;

  const reduction = promotion.prix_original > 0 ? Math.round(((promotion.prix_original - promotion.prix_promo) / promotion.prix_original) * 100) : 0;
  const available = promotion.statut === "actif" && promotion.is_active !== false && promotion.stock > 0;

  return <main className="min-h-screen bg-black text-white px-4 py-6 md:px-8 lg:px-16"><div className="max-w-6xl mx-auto"><Button variant="ghost" onClick={() => router.back()} className="mb-6">← Retour</Button><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><Card className="overflow-hidden">{promotion.photo_url ? <img src={promotion.photo_url} alt={promotion.titre} className="w-full aspect-square object-cover" /> : <div className="aspect-square flex items-center justify-center text-6xl bg-zinc-900">📦</div>}</Card><div className="space-y-6"><div><span className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm mb-4">{promotion.categorie}</span><h1 className="text-3xl md:text-5xl font-bold">{promotion.titre}</h1></div><div className="flex items-end gap-4"><span className="text-3xl md:text-4xl font-bold text-orange-500">{Number(promotion.prix_promo).toLocaleString()} FCFA</span>{promotion.prix_original > promotion.prix_promo && <span className="text-zinc-500 line-through mb-1">{Number(promotion.prix_original).toLocaleString()} FCFA</span>}</div>{reduction > 0 && <div className="text-green-400 font-semibold">🔥 Économisez {reduction}%</div>}<Card className="space-y-3"><h2 className="font-bold text-lg">Description</h2><p className="text-zinc-300 whitespace-pre-line">{promotion.description || "Aucune description disponible."}</p></Card><Card className="space-y-2"><h2 className="font-bold">📍 Localisation</h2><p className="text-zinc-300">{[promotion.ville, promotion.pays].filter(Boolean).join(", ") || "Non précisée"}</p>{promotion.delai_livraison_jours && <p className="text-zinc-300">🚚 Livraison estimée : {promotion.delai_livraison_jours} jour(s)</p>}</Card><Card><h2 className="font-bold mb-2">👤 Vendeur</h2><p className="text-zinc-300">{vendeur?.nom || "Vendeur Promo's World"}</p></Card>{error && <p className="text-red-400 text-sm">{error}</p>}<div className="flex flex-col sm:flex-row gap-3"><Button className="flex-1" disabled={!available || buying} onClick={() => void buy()}>{buying ? "Traitement…" : available ? "Acheter maintenant" : "Indisponible"}</Button><Button variant="secondary" className="flex-1" disabled={!available} onClick={() => router.push(`/reserver/${promotion.id}`)}>Réserver (20%)</Button><Button variant="secondary" className="flex-1" onClick={() => router.push(`/chat/${promotion.vendeur_id}`)}>💬 Contacter</Button></div><p className="text-xs text-zinc-500">Le paiement est bloqué dans votre portefeuille jusqu'à la réception et la confirmation de conformité. La commission de 2% est appliquée uniquement à la finalisation.</p></div></div></div></main>;
}