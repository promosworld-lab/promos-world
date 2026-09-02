'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageCircle,
  Package,
  ShoppingCart,
  Tag,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

export default function PromotionDetailsPage() {
  const params = useParams();

  const [promotion, setPromotion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadPromotion();
    }
  }, [params?.id]);

  async function loadPromotion() {
    setLoading(true);

    const { data, error } = await supabase
      .from('promotions')
      .select(`
        *,
        vendeur:profiles!promotions_vendeur_id_fkey (
          id,
          nom,
          telephone
        )
      `)
      .eq('id', params.id)
      .single();

    if (!error) {
      setPromotion(data);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-[500px] rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (!promotion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-black">
            Promotion introuvable
          </h1>

          <Link
            href="/promo"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-black"
          >
            Retour aux promotions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/promo"
          className="mb-7 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400"
        >
          <ArrowLeft size={18} />
          Retour aux promotions
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* IMAGE */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {promotion.photo_url ? (
              <img
                src={promotion.photo_url}
                alt={promotion.titre}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-orange-500/20 to-black text-8xl">
                🛍️
              </div>
            )}
          </div>

          {/* INFO */}
          <div>
            <span className="inline-flex rounded-full bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
              {promotion.categorie}
            </span>

            <h1 className="mt-5 text-3xl font-black sm:text-5xl">
              {promotion.titre}
            </h1>

            <div className="mt-6 flex items-end gap-4">
              <span className="text-xl text-gray-500 line-through">
                {Number(promotion.prix_original).toLocaleString()} FCFA
              </span>

              <span className="text-3xl font-black text-orange-400">
                {Number(promotion.prix_promo).toLocaleString()} FCFA
              </span>
            </div>

            {promotion.description && (
              <div className="mt-8 border-t border-white/10 pt-8">
                <h2 className="font-bold">Description</h2>

                <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-400">
                  {promotion.description}
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {promotion.stock !== null && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <Package className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Stock</p>
                    <p className="font-semibold">
                      {promotion.stock} disponible(s)
                    </p>
                  </div>
                </div>
              )}

              {promotion.ville && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <MapPin className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Localisation</p>
                    <p className="font-semibold">
                      {promotion.ville}
                      {promotion.pays ? `, ${promotion.pays}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {promotion.date_expiration && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <Calendar className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Expire le</p>
                    <p className="font-semibold">
                      {new Date(
                        promotion.date_expiration
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {promotion.delai_livraison_jours && (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 p-4">
                  <Tag className="text-orange-500" size={20} />
                  <div>
                    <p className="text-xs text-gray-500">Livraison</p>
                    <p className="font-semibold">
                      {promotion.delai_livraison_jours} jour(s)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/acheter/${promotion.id}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400"
              >
                <ShoppingCart size={20} />
                Acheter
              </Link>

              <Link
                href={`/reserver/${promotion.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-4 font-bold transition hover:border-orange-500 hover:text-orange-400"
              >
                <Calendar size={20} />
                Réserver
              </Link>
            </div>

            {promotion.vendeur?.id && (
              <Link
                href={`/chat/${promotion.vendeur.id}`}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-4 text-gray-400 transition hover:text-white"
              >
                <MessageCircle size={19} />
                Contacter le vendeur
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}