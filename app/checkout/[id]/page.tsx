"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MapPin, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: auth } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (auth || !user || !id) return;
    
    void (async () => {
      try {
        const { data: ord, error: ordErr } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .eq("buyer_id", user.id)
          .single();
          
        if (ordErr || !ord) throw new Error("Commande introuvable ou vous n'avez pas l'accès.");
        if (ord.status !== "payment_pending" && ord.status !== "pending") {
          throw new Error("Cette commande a déjà été traitée.");
        }
        setOrder(ord);
        
        const { data: subs, error: subsErr } = await supabase
          .from("sub_orders")
          .select("*, shops(name), order_items(*, products(title))")
          .eq("order_id", id);
          
        if (subsErr) throw subsErr;
        setSubOrders(subs || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, user, id]);

  if (auth || loading) return <main className="min-h-screen bg-black flex items-center justify-center"><LoadingSpinner /></main>;
  if (!order) return <main className="min-h-screen bg-black text-white p-8">{error}</main>;

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      // Simulate real gateway payment
      const { error: payErr } = await supabase.rpc('simulate_v2_payment', { p_order_id: id });
      if (payErr) throw payErr;
      
      // Redirect to the buyer's order history page
      router.push(`/profil/commandes/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Paiement impossible.");
    } finally {
      setBusy(false);
    }
  };

  const address = order.shipping_address;

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/panier" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">
          ← Revenir au panier
        </Link>
        <h1 className="mt-4 text-3xl font-black">Paiement Sécurisé</h1>
        
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          
          <section className="space-y-6 lg:col-span-2">
            {/* Address */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold mb-4">Livraison</h2>
              {address && Object.keys(address).length > 0 ? (
                <div className="rounded-2xl border border-orange-500/50 bg-orange-500/5 p-4 flex gap-4">
                  <MapPin className="mt-1 text-orange-500 shrink-0" size={24} />
                  <div>
                    <p className="font-bold">{address.recipient_name}</p>
                    <p className="text-sm text-zinc-400 mt-1">{address.phone}</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {address.address}, {address.city}, {address.country}
                    </p>
                    {address.instructions && (
                      <p className="text-sm text-zinc-500 mt-2 bg-black p-2 rounded-lg border border-white/5">
                        Note: {address.instructions}
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className="ml-auto text-orange-500" size={24} />
                </div>
              ) : (
                <p className="text-zinc-500">Aucune adresse sélectionnée.</p>
              )}
            </div>

            {/* SubOrders Details */}
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
              <h2 className="text-xl font-bold mb-6">Récapitulatif de la commande</h2>
              <div className="space-y-6">
                {subOrders.map(sub => (
                  <div key={sub.id} className="rounded-2xl bg-black border border-white/5 overflow-hidden">
                    <div className="bg-white/5 px-4 py-3 border-b border-white/5">
                      <p className="font-bold">Boutique: <span className="text-orange-400">{sub.shops?.name}</span></p>
                    </div>
                    <div className="p-4 space-y-3">
                      {sub.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold">{item.products?.title}</span>
                            <span className="text-zinc-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-bold text-zinc-300">
                            {(item.unit_price * item.quantity).toLocaleString()} F
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-zinc-950 px-4 py-3 border-t border-white/5 flex justify-between text-sm">
                      <span className="text-zinc-500">Frais de livraison</span>
                      <span className="font-bold text-orange-500">{sub.shipping_fee} F</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <h2 className="text-2xl font-black">Paiement</h2>
            
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Sous-total articles</span>
                <span>{order.total_amount.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Livraison</span>
                <span>Inclus</span>
              </div>
              
              <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-black">
                <span>Total à payer</span>
                <span className="text-orange-500">{order.total_amount.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            {error && (
              <p className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium">
                {error}
              </p>
            )}
            
            <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-sm text-zinc-300">
              <ShieldCheck className="mb-3 text-emerald-500" size={24} />
              <b className="text-white block mb-1">Paiement 100% sécurisé</b>
              Vos fonds sont bloqués sur un compte séquestre. Le vendeur n'est payé qu'une fois votre livraison confirmée.
            </div>
            
            <button 
              disabled={busy || !address || Object.keys(address).length === 0} 
              onClick={() => void pay()} 
              className="mt-6 flex items-center justify-center gap-3 w-full rounded-2xl bg-orange-500 px-6 py-5 font-black text-black disabled:opacity-40 transition-transform active:scale-95"
            >
              <Lock size={18} />
              {busy ? "Traitement bancaire..." : `Payer ${order.total_amount.toLocaleString()} FCFA`}
            </button>
            <p className="mt-4 text-center text-xs text-zinc-500">
              Moyens de paiement acceptés: Mobile Money (MTN, Moov, Celtiis) et Cartes Bancaires.
            </p>
          </aside>
          
        </div>
      </div>
    </main>
  );
}