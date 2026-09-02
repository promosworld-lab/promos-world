'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Tag,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    setLoading(true);

    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('statut', 'actif')
      .order('created_at', { ascending: false });

    if (!error) {
      setPromotions(data || []);
    }

    setLoading(false);
  }

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(promotions.map((item) => item.categorie).filter(Boolean)),
    ];

    return ['Toutes', ...uniqueCategories];
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const matchesSearch =
        promotion.titre
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        promotion.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === 'Toutes' || promotion.categorie === category;

      return matchesSearch && matchesCategory;
    });
  }, [promotions, search, category]);

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500">
            <Tag size={17} />
            PROMO&apos;S WORLD
          </div>

          <h1 className="mt-3 text-3xl font-black sm:text-5xl">
            Découvrez les meilleures promotions
          </h1>

          <p className="mt-4 max-w-2xl text-gray-500">
            Explorez les offres disponibles et trouvez les opportunités qui
            vous correspondent.
          </p>
        </div>

        {/* SEARCH */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-black px-4">
              <Search size={20} className="text-gray-500" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une promotion..."
                className="w-full bg-transparent py-4 outline-none placeholder:text-gray-600"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto">
              <SlidersHorizontal className="shrink-0 text-orange-500" size={20} />

              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    category === item
                      ? 'bg-orange-500 text-black'
                      : 'border border-white/10 text-gray-400 hover:border-orange-500'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="mt-10">
          <p className="mb-6 text-sm text-gray-500">
            {filteredPromotions.length} promotion(s) trouvée(s)
          </p>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-[350px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 py-20 text-center">
              <ShoppingBag
                size={42}
                className="mx-auto text-orange-500"
              />

              <h2 className="mt-5 text-xl font-bold">
                Aucune promotion trouvée
              </h2>

              <p className="mt-2 text-gray-500">
                Essayez une autre recherche ou revenez plus tard.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPromotions.map((promotion) => (
                <Link
                  key={promotion.id}
                  href={`/promo/${promotion.id}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-orange-500/50"
                >
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-orange-500/20 to-black text-5xl">
                    {promotion.photo_url ? (
                      <img
                        src={promotion.photo_url}
                        alt={promotion.titre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      '🛍️'
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                        {promotion.categorie}
                      </span>

                      {promotion.stock > 0 && (
                        <span className="text-xs text-green-400">
                          Disponible
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 line-clamp-2 text-xl font-bold">
                      {promotion.titre}
                    </h2>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-gray-500 line-through">
                          {Number(
                            promotion.prix_original
                          ).toLocaleString()} FCFA
                        </p>

                        <p className="text-lg font-black text-orange-400">
                          {Number(
                            promotion.prix_promo
                          ).toLocaleString()} FCFA
                        </p>
                      </div>

                      <ArrowRight
                        size={20}
                        className="transition group-hover:translate-x-1 group-hover:text-orange-400"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}