"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Bell, Clock, Heart, MapPin, Minus, Plus, Share2, ShieldCheck, ShoppingCart } from "lucide-react";
import { promotionsService } from "@/lib/services/promotions.service";
import { buyerService } from "@/lib/services/buyer.service";
import { supabase } from "@/lib/supabase/client";
import type { Profile, Promotion } from "@/types/database";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";
import ErrorState from "@/components/common/ErrorState";

function getCountdown(end: string | null) {
  if (!end) return null;
  const remaining = new Date(end).getTime() - Date.now();
  if (remaining <= 0) return "Terminée";
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor(remaining / 3600000) % 24;
  const minutes = Math.floor(remaining / 60000) % 60;
  return days > 0 ? `${days}j ${hours}h restantes` : `${hours}h ${minutes}min restantes`;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [alertActive, setAlertActive] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [countdown, setCountdown] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const item = await promotionsService.getById(id);
        setPromotion(item);
        if (!item) return;
        const { data } = await supabase.from("profiles").select("*").eq("id", item.vendeur_id).maybeSingle();
        setSeller(data as Profile | null);
        void buyerService.recent(item.id);
        try {
          setFavorite(await buyerService.isFavorite(item.id));
          setAlertActive((await buyerService.alerts()).some((a) => a.promotion_id === item.id && a.active));
        } catch {
          setFavorite(false);
          setAlertActive(false);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Impossible de charger le produit.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!promotion?.date_fin_promo) return;
    const update = () => setCountdown(getCountdown(promotion.date_fin_promo) ?? "");
    update();
    const timer = window.setInterval(update, 60000);
    return () => window.clearInterval(timer);
  }, [promotion?.date_fin_promo]);

  const reduction = useMemo(() => {
    if (!promotion || promotion.prix_original <= promotion.prix_promo) return 0;
    return Math.round(((promotion.prix_original - promotion.prix_promo) / promotion.prix_original) * 100);
  }, [promotion]);

  if (loading) return <Loading />;
  if (!promotion) return <ErrorState title="Publication introuvable" message={message || "Cet article n'est plus disponible."} />;

  const available = promotion.statut === "actif" && promotion.is_active !== false && promotion.stock > 0;
  const toggleFavorite = async () => {
    try {
      setFavorite(await buyerService.toggleFavorite(promotion.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connectez-vous pour utiliser les favoris.");
    }
  };
  const addToCart = async () => {
    try {
      await buyerService.addCart(promotion.id, quantity);
      router.push("/panier");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d'ajouter au panier.");
    }
  };
  const toggleAlert = async () => {
    try {
      await buyerService.toggleAlert(promotion.id);
      setAlertActive((current) => !current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Connectez-vous pour activer une alerte.");
    }
  };
  const share = () => {
    void navigator.clipboard?.writeText(window.location.href);
    setMessage("Lien du produit copié.");
  };

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/promo" className="text-sm text-zinc-500">← Marketplace</Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
              <div className="aspect-square bg-zinc-900">
                {promotion.photo_url ? <img src={promotion.photo_url} alt={promotion.titre} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-7xl">📦</div>}
                {reduction > 0 && <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-sm font-black text-black">-{reduction}%</span>}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-orange-400">{promotion.categorie}</span>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">{promotion.titre}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={() => void toggleFavorite()} className={`rounded-full border p-3 ${favorite ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/10 text-zinc-400"}`} aria-label="Favori">
                  <Heart fill={favorite ? "currentColor" : "none"} size={20} />
                </button>
                <button onClick={share} className="rounded-full border border-white/10 p-3 text-zinc-400" aria-label="Partager"><Share2 size={20} /></button>
              </div>
            </div>

            <div>
              <span className="text-3xl font-black text-orange-500">{Number(promotion.prix_promo).toLocaleString()} FCFA</span>
              {promotion.prix_original > promotion.prix_promo && <span className="ml-3 text-zinc-600 line-through">{Number(promotion.prix_original).toLocaleString()} FCFA</span>}
            </div>

            {countdown && <div className="flex items-center gap-2 rounded-xl bg-orange-500/10 p-3 text-sm font-semibold text-orange-300"><Clock size={17} /> Promotion : {countdown}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-zinc-950 p-4"><p className="text-xs text-zinc-500">Stock</p><p className="mt-1 font-bold">{promotion.stock > 0 ? `${promotion.stock} disponible(s)` : "Rupture"}</p></div>
              <div className="rounded-2xl bg-zinc-950 p-4"><p className="text-xs text-zinc-500">Livraison</p><p className="mt-1 font-bold">{promotion.delai_livraison_jours ? `${promotion.delai_livraison_jours} jour(s)` : "À confirmer"}</p></div>
            </div>

            <Card><h2 className="font-bold">Description</h2><p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-400">{promotion.description || "Aucune description disponible."}</p></Card>

            <Card><div className="flex items-center gap-3"><ShieldCheck className="text-green-400" /><div><p className="font-bold">Paiement protégé</p><p className="text-xs text-zinc-500">Votre argent reste bloqué jusqu'à confirmation de conformité.</p></div></div></Card>

            <Card>
              <div className="flex gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-black text-black">{(seller?.nom || "V")[0]}</div>
                <div>
                  <p className="font-bold">{seller?.nom || "Vendeur Promo's World"}</p>
                  <p className="text-xs text-zinc-500">Compte vendeur</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><MapPin size={13} />{[promotion.ville, promotion.pays].filter(Boolean).join(", ") || "Localisation non précisée"}</div>
                </div>
              </div>
            </Card>

            <div className="flex items-center gap-3"><span className="text-sm text-zinc-500">Quantité</span><div className="flex items-center rounded-xl border border-white/10"><button disabled={quantity <= 1} onClick={() => setQuantity((q) => q - 1)} className="p-3"><Minus size={15} /></button><span className="w-10 text-center">{quantity}</span><button disabled={quantity >= promotion.stock} onClick={() => setQuantity((q) => Math.min(promotion.stock, q + 1))} className="p-3"><Plus size={15} /></button></div></div>

            {message && <p className="rounded-xl bg-orange-500/10 p-3 text-sm text-orange-200">{message}</p>}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button disabled={!available} onClick={() => router.push(`/acheter/${promotion.id}?quantity=${quantity}`)}>{available ? "Acheter maintenant" : "Indisponible"}</Button>
              <Button variant="secondary" disabled={!available} onClick={() => void addToCart()}><ShoppingCart size={17} /> Ajouter au panier</Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" disabled={!available} onClick={() => router.push(`/reserver/${promotion.id}`)}>Réserver · 20%</Button>
              <button onClick={() => void toggleAlert()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300"><Bell size={17} />{alertActive ? "Alerte activée" : "Alerter sur prix/stock"}</button>
            </div>
            <button onClick={() => router.push(`/chat/${promotion.vendeur_id}`)} className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold">💬 Contacter le vendeur</button>
          </div>
        </div>
      </div>
    </main>
  );
}
