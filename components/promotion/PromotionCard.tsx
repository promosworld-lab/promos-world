"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Package,
  Tag,
  Clock,
} from "lucide-react";

import type { Promotion } from "@/types";

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({
  promotion,
}: PromotionCardProps) {
  const discount = Math.round(
    ((Number(promotion.prix_original) -
      Number(promotion.prix_promo)) /
      Number(promotion.prix_original)) *
      100
  );

  const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <Link
      href={`/promo/${promotion.id}`}
      className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-500/10"
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        {promotion.photo_url ? (
          <Image
            src={promotion.photo_url}
            alt={promotion.titre}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <Package size={50} />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
          -{discount}%
        </div>

        {promotion.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="rounded-lg bg-zinc-900 px-3 py-1 text-xs text-orange-400">
            <Tag size={13} className="mr-1 inline" />
            {promotion.categorie}
          </span>

          <span className="text-xs text-zinc-500">
            Stock : {promotion.stock}
          </span>
        </div>

        <h2 className="line-clamp-2 text-lg font-bold transition group-hover:text-orange-400">
          {promotion.titre}
        </h2>

        {promotion.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
            {promotion.description}
          </p>
        )}

        {/* LOCATION */}
        {(promotion.ville || promotion.pays) && (
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
            <MapPin size={15} />

            {[promotion.ville, promotion.pays]
              .filter(Boolean)
              .join(", ")}
          </div>
        )}

        {/* DELIVERY */}
        {promotion.delai_livraison_jours && (
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <Clock size={15} />
            Livraison estimée : {promotion.delai_livraison_jours} jours
          </div>
        )}

        {/* PRICE */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-zinc-500">Prix promotion</p>

            <p className="text-xl font-bold text-orange-500">
              {formatPrice(promotion.prix_promo)} FCFA
            </p>

            <p className="text-sm text-zinc-600 line-through">
              {formatPrice(promotion.prix_original)} FCFA
            </p>
          </div>

          <span className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition group-hover:bg-orange-500">
            Voir
          </span>
        </div>
      </div>
    </Link>
  );
}