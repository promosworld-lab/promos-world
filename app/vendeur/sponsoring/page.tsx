'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sellerService } from '@/lib/services/seller.service';
import { supabase } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function SponsoringPage() {
  const { user, profile, loading: authLoad } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form
  const [selectedProduct, setSelectedProduct] = useState('');
  const [city, setCity] = useState('Cotonou');
  const [weeks, setWeeks] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoad && user) {
      Promise.all([
        sellerService.products(user.id),
        sellerService.campaigns(user.id)
      ]).then(([p, c]) => {
        setProducts(p.filter(x => x.status === 'active'));
        setCampaigns(c);
      }).finally(() => setLoading(false));
    }
  }, [authLoad, user]);

  const totalCost = weeks * 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) { setMessage('Sélectionnez un produit.'); return; }
    setProcessing(true); setMessage('');

    try {
      const shopId = await sellerService._getShopId(user!.id);
      
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + (weeks * 7));

      // Simulate payment by generating a double-entry ledger via RPC or just insert campaign directly
      // Real flow: Checkout -> Payment -> Activate Campaign
      // For now, we simulate success and insert the campaign
      const { data, error } = await supabase.from('sponsorship_campaigns').insert({
        shop_id: shopId,
        product_id: selectedProduct,
        target_city: city,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        status: 'active',
        budget_spent: 0
      }).select().single();

      if (error) throw error;
      
      // Update campaigns state
      const pName = products.find(p => p.id === selectedProduct)?.title || 'Produit';
      setCampaigns([{...data, products: { title: pName }}, ...campaigns]);
      setMessage('Campagne activée avec succès !');
    } catch (err: any) {
      setMessage(err.message || 'Erreur lors de la création.');
    } finally {
      setProcessing(false);
    }
  };

  if (authLoad || loading) return <LoadingSpinner />;
  if (!user || profile?.role !== 'vendeur') return <p>Accès vendeur requis.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-black">Sponsoring (Mise en avant)</h1>
        <p className="mt-2 text-zinc-400">Boostez la visibilité de vos offres sur la page d'accueil et par ville.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold mb-4">Créer une campagne</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && <div className="p-3 bg-zinc-900 text-orange-500 rounded-lg text-sm">{message}</div>}
            
            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Produit à sponsoriser</span>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="w-full rounded-xl bg-black p-3 border border-white/10" required>
                <option value="">-- Choisir --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Ville cible</span>
              <select value={city} onChange={e => setCity(e.target.value)} className="w-full rounded-xl bg-black p-3 border border-white/10">
                <option value="Cotonou">Cotonou</option>
                <option value="Abomey-Calavi">Abomey-Calavi</option>
                <option value="Porto-Novo">Porto-Novo</option>
                <option value="Parakou">Parakou</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm text-zinc-400">Durée (semaines)</span>
              <input type="number" min="1" max="4" value={weeks} onChange={e => setWeeks(Number(e.target.value))} className="w-full rounded-xl bg-black p-3 border border-white/10" />
            </label>

            <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
              <div className="flex justify-between items-center font-bold text-orange-500">
                <span>Total à payer</span>
                <span>{totalCost.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button type="submit" disabled={processing} className="w-full py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 disabled:opacity-50">
              {processing ? 'Activation...' : 'Payer & Activer'}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">Vos campagnes</h2>
          {campaigns.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/5 rounded-3xl text-zinc-500">
              Aucune campagne active.
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => (
                <div key={c.id} className="p-4 bg-zinc-950 border border-white/10 rounded-xl">
                  <b className="block text-lg">{c.products?.title || 'Produit inconnu'}</b>
                  <p className="text-sm text-zinc-400 mt-1">Ville : {c.target_city} · Statut : {c.status}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Du {new Date(c.start_date).toLocaleDateString()} au {new Date(c.end_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
