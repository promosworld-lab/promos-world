"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  MapPin,
  Package,
  ShoppingCart,
  CalendarDays,
  Clock,
  MessageCircle,
} from "lucide-react";

import { usePromotion } from "@/hooks/usePromotion";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PromotionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const promotionId = params.id as string;

  const { promotion, loading, error } =
    usePromotion(promotionId);

  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </main>
    );
  }

  if (error || !promotion) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-md text-center">
          <Package
            size={50}
            className="mx-auto mb-4 text-zinc-600"
          />

          <h1 className="text-2xl font-bold">
            Promotion introuvable
          </h1>

          <p className="mt-2 text-zinc-500">
            Cette promotion n&apos;existe plus ou n&apos;est plus disponible.
          </p>

          <Link
            href="/promo"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black"
          >
            Voir les promotions
          </Link>
        </div>
      </main>
    );
  }

  const discount = Math.round(
    ((Number(promotion.prix_original) -
      Number(promotion.prix_promo)) /
      Number(promotion.prix_original)) *
      100
  );

  const formatPrice = (price: number | string) =>
    new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <main className="min-h-screen bg-black pb-28 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-orange-400"
        >
          <ArrowLeft size={18} />
          Retour
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* MEDIA */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
              {promotion.photo_url && !imageError ? (
                <Image
                  src={promotion.photo_url}
                  alt={promotion.titre}
                  fill
                  priority
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-700">
                  <Package size={80} />
                </div>
              )}

              <div className="absolute left-5 top-5 rounded-full bg-orange-500 px-4 py-2 font-bold text-black">
                -{discount}%
              </div>
            </div>
          </div>

          {/* INFORMATION */}
          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-orange-500/10 px-3 py-1 text-sm text-orange-400">
                {promotion.categorie}
              </span>

              {promotion.stock > 0 ? (
                <span className="rounded-lg bg-green-500/10 px-3 py-1 text-sm text-green-400">
                  En stock ({promotion.stock})
                </span>
              ) : (
                <span className="rounded-lg bg-red-500/10 px-3 py-1 text-sm text-red-400">
                  Rupture de stock
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold sm:text-4xl">
              {promotion.titre}
            </h1>

            {promotion.description && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-zinc-400">
                {promotion.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-7 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                Prix promotion
              </p>

              <div className="mt-2 flex items-end gap-4">
                <span className="text-3xl font-bold text-orange-500">
                  {formatPrice(promotion.prix_promo)} FCFA
                </span>

                <span className="pb-1 text-zinc-600 line-through">
                  {formatPrice(promotion.prix_original)} FCFA
                </span>
              </div>

              <p className="mt-2 text-sm text-green-400">
                Vous économisez{" "}
                {formatPrice(
                  Number(promotion.prix_original) -
                    Number(promotion.prix_promo)
                )}{" "}
                FCFA
              </p>
            </div>

            {/* DETAILS */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {(promotion.ville || promotion.pays) && (
                <InfoItem
                  icon={<MapPin size={20} />}
                  label="Localisation"
                  value={[promotion.ville, promotion.pays]
                    .filter(Boolean)
                    .join(", ")}
                />
              )}

              {promotion.delai_livraison_jours && (
                <InfoItem
                  icon={<Clock size={20} />}
                  label="Livraison"
                  value={`${promotion.delai_livraison_jours} jours`}
                />
              )}

              {promotion.date_expiration && (
                <InfoItem
                  icon={<CalendarDays size={20} />}
                  label="Expiration"
                  value={new Date(
                    promotion.date_expiration
                  ).toLocaleDateString("fr-FR")}
                />
              )}
            </div>

            {/* ACTIONS */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/acheter/${promotion.id}`}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-4 font-bold transition ${
                  promotion.stock > 0
                    ? "bg-orange-500 text-black hover:bg-orange-400"
                    : "pointer-events-none bg-zinc-800 text-zinc-500"
                }`}
              >
                <ShoppingCart size={20} />
                Acheter maintenant
              </Link>

              <Link
                href={`/reserver/${promotion.id}`}
                className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-4 font-bold transition ${
                  promotion.stock > 0
                    ? "border-zinc-700 hover:border-orange-500 hover:text-orange-400"
                    : "pointer-events-none border-zinc-800 text-zinc-600"
                }`}
              >
                <CalendarDays size={20} />
                Réserver
              </Link>
            </div>

            <Link
              href={`/chat/${promotion.vendeur_id}?promotion=${promotion.id}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-4 font-medium text-white transition hover:bg-zinc-800"
            >
              <MessageCircle size={20} />
              Contacter le vendeur
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-orange-500">{icon}</div>

      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="mt-1 text-sm font-medium text-white">
          {value}
        </p>
      </div>
    </div>
  );
}