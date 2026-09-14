'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, MapPin, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buyerService } from '@/lib/services/buyer.service';
import { supabase } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [addressReady, setAddressReady] = useState(false);
  const router = useRouter();

  async function load() {
    try {
      const cartData = await buyerService.cart();
      setCart(cartData);
      
      const { data } = await supabase.from('addresses').select('id').eq('is_default', true).maybeSingle();
      setAddressReady(!!data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateItem(itemId: string, currentQty: number, change: number) {
    const newQty = currentQty + change;
    if (newQty < 1) {
      await buyerService.removeCart(itemId);
    } else {
      await buyerService.updateCart(itemId, newQty);
    }
    await load();
  }

  async function checkout() {
    setBusy(true);
    try {
      const ids = await buyerService.checkout();
      if (ids.length > 0) {
        // Rediriger vers le workflow de paiement
        router.push(`/checkout/${ids[0]}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Paiement impossible.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <main className='min-h-screen bg-black flex items-center justify-center'><LoadingSpinner /></main>;

  const hasItems = cart?.sub_orders?.length > 0;
  const globalTotal = cart?.total_amount || 0;

  return (
    <main className='min-h-screen bg-black text-white p-4 sm:p-8'>
      <div className='mx-auto max-w-6xl'>
        <p className='text-orange-500 font-bold uppercase tracking-widest'>Votre Sélection</p>
        <h1 className='mt-2 text-4xl font-black'>Mon Panier</h1>

        {!hasItems ? (
          <div className='mt-12 rounded-3xl border border-dashed border-white/10 p-16 text-center bg-zinc-950'>
            <ShoppingCart className='mx-auto text-orange-500 w-16 h-16' />
            <h2 className='mt-6 text-2xl font-black'>Votre panier est vide</h2>
            <p className='mt-2 text-zinc-500'>Découvrez les meilleures offres sur le marketplace.</p>
            <button onClick={() => router.push('/')} className='mt-8 rounded-xl bg-orange-500 px-6 py-4 font-bold text-black transition-transform hover:scale-105 active:scale-95'>
              Explorer le marketplace
            </button>
          </div>
        ) : (
          <div className='mt-10 grid gap-8 lg:grid-cols-[1fr_400px]'>
            
            {/* Multi-Vendor Cart List */}
            <div className='space-y-8'>
              {cart.sub_orders.map((subOrder: any) => (
                <section key={subOrder.sub_order_id} className='rounded-3xl border border-white/10 bg-zinc-950 overflow-hidden'>
                  <div className='bg-white/5 px-6 py-4 flex items-center gap-3 border-b border-white/5'>
                    <Store className='text-orange-500' size={20} />
                    <h2 className='font-bold text-lg'>Vendu par <span className='text-orange-400'>{subOrder.shop_name}</span></h2>
                  </div>
                  <div className='p-6 space-y-4'>
                    {subOrder.items?.map((item: any) => (
                      <article key={item.item_id} className='flex gap-5'>
                        {/* Image Placeholder - A relier au storage V2 */}
                        <div className='h-28 w-28 shrink-0 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center'>
                          <ShoppingCart className='text-zinc-700' size={32} />
                        </div>
                        
                        <div className='flex flex-col justify-between w-full'>
                          <div className='flex justify-between items-start gap-4'>
                            <div>
                              <h3 className='font-bold text-lg'>{item.title}</h3>
                              <p className='text-orange-500 font-black mt-1'>
                                {Number(item.unit_price).toLocaleString()} FCFA
                              </p>
                            </div>
                            <strong className='text-lg'>
                              {(Number(item.unit_price) * item.quantity).toLocaleString()} F
                            </strong>
                          </div>
                          
                          <div className='flex items-center gap-4 mt-4'>
                            <div className='flex items-center gap-3 bg-black border border-white/10 rounded-xl px-2 py-1'>
                              <button onClick={() => updateItem(item.item_id, item.quantity, -1)} className='p-2 hover:text-orange-500 transition-colors'>
                                <Minus size={16} />
                              </button>
                              <span className='font-bold min-w-[20px] text-center'>{item.quantity}</span>
                              <button onClick={() => updateItem(item.item_id, item.quantity, 1)} className='p-2 hover:text-orange-500 transition-colors'>
                                <Plus size={16} />
                              </button>
                            </div>
                            <button onClick={() => updateItem(item.item_id, item.quantity, -item.quantity)} className='text-zinc-500 hover:text-red-400 transition-colors p-2'>
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Checkout Sidebar */}
            <aside className='h-fit rounded-3xl border border-white/10 bg-zinc-950 p-8 lg:sticky lg:top-24'>
              <h2 className='text-2xl font-black'>Résumé</h2>
              
              <div className='mt-8 space-y-4 text-sm'>
                {cart.sub_orders.map((subOrder: any) => (
                  <div key={subOrder.sub_order_id} className='flex justify-between text-zinc-400'>
                    <span>Sous-total ({subOrder.shop_name})</span>
                    <span>{Number(subOrder.sub_total).toLocaleString()} FCFA</span>
                  </div>
                ))}
              </div>

              <div className='my-6 border-t border-white/10' />
              
              <div className='flex justify-between items-end'>
                <span className='text-lg font-bold'>Total</span>
                <span className='text-3xl font-black text-orange-500'>{globalTotal.toLocaleString()} FCFA</span>
              </div>

              <div className='mt-8 rounded-2xl border border-white/10 bg-black p-5 text-sm'>
                <div className='flex items-center gap-3 font-bold text-base'>
                  <MapPin size={20} className='text-orange-500' /> Adresse de livraison
                </div>
                <p className='mt-2 text-zinc-400 leading-relaxed'>
                  {addressReady 
                    ? 'Votre adresse par défaut sera utilisée pour les expéditions.' 
                    : 'Vous devez définir une adresse de livraison par défaut avant de payer.'}
                </p>
                <button onClick={() => router.push('/adresses')} className='mt-3 text-sm font-bold text-orange-500 hover:underline'>
                  Gérer mes adresses →
                </button>
              </div>

              <p className='mt-6 text-xs text-zinc-500 text-center'>
                Le paiement est sécurisé et bloqué en séquestre jusqu'à votre confirmation de réception (délai de 24h).
              </p>

              <button 
                disabled={busy || !addressReady} 
                onClick={() => void checkout()} 
                className='mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-orange-500 px-6 py-5 font-black text-black disabled:cursor-not-allowed disabled:opacity-50 transition-transform active:scale-95'
              >
                {busy ? 'Traitement en cours…' : 'Procéder au Paiement'}
                <ArrowRight size={20} />
              </button>
            </aside>
            
          </div>
        )}
      </div>
    </main>
  );
}
