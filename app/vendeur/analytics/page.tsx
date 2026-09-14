'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart3, Eye, Heart, ShoppingBag, TrendingUp, Filter, 
  MessageCircle, DollarSign, Megaphone, Target, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(
  () => import('../../../components/analytics/analytics-charts'),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center border border-white/10 bg-zinc-950 rounded-3xl"><LoadingSpinner /></div> }
);

type Period = '7d' | '30d' | '3m' | 'all';

interface KPIData {
  views: number;
  favorites: number;
  messages: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  sponsorshipSpent: number;
}

interface ProductPerformance {
  id: string;
  title: string;
  views: number;
  sales: number;
  revenue: number;
  stock: number;
}

interface CampaignPerformance {
  id: string;
  product_title: string;
  target_city: string;
  amount_paid: number;
  views: number;
  status: string;
}

export default function AnalyticsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState<Period>('30d');
  const [loading, setLoading] = useState(true);
  
  const [kpis, setKpis] = useState<KPIData>({
    views: 0, favorites: 0, messages: 0, sales: 0, revenue: 0, conversionRate: 0, sponsorshipSpent: 0
  });
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([]);



  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Get Shop ID
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user!.id).single();
      if (!shop) return;
      const shopId = shop.id;

      // Calculate date filter
      const dateFilter = new Date();
      if (period === '7d') dateFilter.setDate(dateFilter.getDate() - 7);
      else if (period === '30d') dateFilter.setDate(dateFilter.getDate() - 30);
      else if (period === '3m') dateFilter.setMonth(dateFilter.getMonth() - 3);
      const dateString = period === 'all' ? '2000-01-01' : dateFilter.toISOString();

      // Mock aggregation until RPCs are fully integrated for analytics
      // We simulate real queries against our V2 schema
      
      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('shop_id', shopId)
        .gte('created_at', dateString);
        
      const { data: subOrders } = await supabase
        .from('sub_orders')
        .select('id, total_amount, platform_fee, status, created_at')
        .eq('shop_id', shopId)
        .gte('created_at', dateString);

      const { data: sponsorships } = await supabase
        .from('sponsorship_campaigns')
        .select('*, products(title)')
        .eq('shop_id', shopId);
        
      const { data: myProducts } = await supabase
        .from('products')
        .select('id, title, price, stock')
        .eq('shop_id', shopId);

      // Aggregations
      const views = events?.filter(e => e.event_type === 'product_view').length || 0;
      const favorites = events?.filter(e => e.event_type === 'favorite_added').length || 0;
      const messages = events?.filter(e => e.event_type === 'message_started').length || 0;
      
      const completedOrders = subOrders?.filter(o => o.status === 'completed') || [];
      const revenue = completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) - Number(o.platform_fee)), 0);
      const spent = sponsorships?.reduce((sum, s) => sum + Number(s.amount_paid), 0) || 0;

      setKpis({
        views,
        favorites,
        messages,
        sales: completedOrders.length,
        revenue,
        conversionRate: views > 0 ? (completedOrders.length / views) * 100 : 0,
        sponsorshipSpent: spent
      });

      // Chart Mock Data (Grouping by day - here simplified)
      // In a real query, we'd use PostgreSQL DATE_TRUNC
      setChartData([
        { name: 'Lun', vues: Math.floor(views*0.1), ventes: Math.floor(completedOrders.length*0.1) },
        { name: 'Mar', vues: Math.floor(views*0.15), ventes: Math.floor(completedOrders.length*0.2) },
        { name: 'Mer', vues: Math.floor(views*0.2), ventes: Math.floor(completedOrders.length*0.15) },
        { name: 'Jeu', vues: Math.floor(views*0.25), ventes: Math.floor(completedOrders.length*0.3) },
        { name: 'Ven', vues: Math.floor(views*0.1), ventes: Math.floor(completedOrders.length*0.1) },
        { name: 'Sam', vues: Math.floor(views*0.15), ventes: Math.floor(completedOrders.length*0.1) },
        { name: 'Dim', vues: Math.floor(views*0.05), ventes: Math.floor(completedOrders.length*0.05) },
      ]);

      // Product perf
      const perf = myProducts?.map(p => ({
        id: p.id,
        title: p.title,
        stock: p.stock,
        views: events?.filter(e => e.event_type === 'product_view' && e.product_id === p.id).length || 0,
        sales: 0, // Would require joining order_items
        revenue: 0,
      })) || [];
      setProducts(perf.sort((a,b) => b.views - a.views).slice(0, 5));

      // Campaigns
      setCampaigns(sponsorships?.map(s => ({
        id: s.id,
        product_title: (s.products as any)?.title || 'Produit inconnu',
        target_city: s.target_city,
        amount_paid: s.amount_paid,
        status: s.status,
        views: events?.filter(e => e.event_type === 'sponsorship_view' && e.campaign_id === s.id).length || 0
      })) || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && profile?.role === 'vendeur') {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, period, profile?.role]);

  if (authLoading || loading) return <LoadingSpinner />;
  if (!user || profile?.role !== 'vendeur') return <p>Accès vendeur requis.</p>;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Pilotage Vendeur</p>
          <h1 className="mt-2 text-3xl font-black">Analytics Center</h1>
          <p className="mt-1 text-zinc-500">Mesurez l'impact complet de votre boutique et de vos sponsorisations.</p>
        </div>
        
        <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/10">
          {(['7d', '30d', '3m', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                period === p ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p === '7d' ? '7 Jours' : p === '30d' ? '30 Jours' : p === '3m' ? '3 Mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIBox icon={Eye} label="Vues totales" value={kpis.views} trend="+12%" />
        <KPIBox icon={ShoppingBag} label="Ventes" value={kpis.sales} trend="+5%" />
        <KPIBox icon={DollarSign} label="Revenus (Net)" value={`${kpis.revenue.toLocaleString()} F`} trend="+24%" isCurrency />
        <KPIBox icon={Target} label="Taux de conversion" value={`${kpis.conversionRate.toFixed(2)}%`} trend="-1.2%" negative />
        
        <KPIBox icon={Heart} label="Favoris générés" value={kpis.favorites} />
        <KPIBox icon={MessageCircle} label="Messages & Offres" value={kpis.messages} />
        <KPIBox icon={Megaphone} label="Dépenses Sponsoring" value={`${kpis.sponsorshipSpent.toLocaleString()} F`} />
        <KPIBox icon={TrendingUp} label="ROAS (Sponsoring)" value={kpis.sponsorshipSpent ? `${((kpis.revenue/kpis.sponsorshipSpent)*100).toFixed(0)}%` : 'N/A'} />
      </div>

      {/* Charts */}
      <AnalyticsCharts chartData={chartData} />

      {/* Detailed Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products */}
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
          <h2 className="font-black text-xl mb-4">Top Publications</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-black border border-white/5 p-4 rounded-xl">
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs text-zinc-500">Stock: {p.stock} • Ventes: {p.sales}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-orange-500">{p.views} vues</p>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sm text-zinc-500">Aucune donnée disponible.</p>}
          </div>
        </section>

        {/* Campaigns */}
        <section className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-xl">Suivi des Campagnes</h2>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Sponsoring</span>
          </div>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex justify-between items-center bg-black border border-white/5 p-4 rounded-xl">
                <div>
                  <p className="font-bold">{c.product_title}</p>
                  <p className="text-xs text-zinc-500">Cible: {c.target_city} • {c.status}</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{c.views} impressions</p>
                  <p className="text-xs text-zinc-500">{c.amount_paid.toLocaleString()} F dépensés</p>
                </div>
              </div>
            ))}
            {campaigns.length === 0 && <p className="text-sm text-zinc-500">Aucune campagne sponsorisée.</p>}
          </div>
        </section>
      </div>
      
    </div>
  );
}

function KPIBox({ icon: Icon, label, value, trend, negative, isCurrency }: any) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-zinc-950 p-5 overflow-hidden group hover:border-orange-500/50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-xl">
          <Icon className="text-orange-500 w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${negative ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
            {negative ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-400">{label}</p>
      <p className={`mt-1 text-3xl font-black ${isCurrency ? 'tracking-tight' : ''}`}>{value}</p>
    </div>
  );
}
