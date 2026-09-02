"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, PackageOpen, Plus } from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";
import { usePromotions } from "@/hooks/usePromotions";
import { PromotionCard } from "@/components/promotion/PromotionCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PromoPage() {
  const { t } = useLanguage();
  const { promotions, loading, error, refresh } = usePromotions();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    refresh();
  }, [refresh]);

  const categories = useMemo(() => {
    const values = promotions
      .map((promotion) => promotion.categorie)
      .filter(Boolean);

    return [...new Set(values)];
  }, [promotions]);

  const filteredPromotions = useMemo(() => {
    return promotions.filter((promotion) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        promotion.titre.toLowerCase().includes(searchValue) ||
        promotion.description?.toLowerCase().includes(searchValue) ||
        promotion.categorie?.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === "all" || promotion.categorie === category;

      return matchesSearch && matchesCategory;
    });
  }, [promotions, search, category]);

  return (
    <main className="min-h-screen bg-black px-4 pb-24 pt-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-orange-500">
              PROMO&apos;S WORLD
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("promotions.title")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Découvrez les meilleures offres et promotions disponibles.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400"
          >
            <Plus size={18} />
            Ajouter une promotion
          </Link>
        </div>

        {/* SEARCH */}
        <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une promotion..."
                className="w-full rounded-xl border border-zinc-800 bg-black py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-2 text-zinc-400">
                <SlidersHorizontal size={18} />
              </div>

              <button
                onClick={() => setCategory("all")}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  category === "all"
                    ? "bg-orange-500 text-black"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                Toutes
              </button>

              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                    category === item
                      ? "bg-orange-500 text-black"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 text-center">
            <p className="text-red-400">{error}</p>

            <button
              onClick={refresh}
              className="mt-4 rounded-xl bg-white px-5 py-2 font-medium text-black"
            >
              Réessayer
            </button>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={42} />}
            title="Aucune promotion trouvée"
            description="Essayez une autre recherche ou une autre catégorie."
          />
        ) : (
          <>
            <div className="mb-5 text-sm text-zinc-500">
              {filteredPromotions.length} promotion
              {filteredPromotions.length > 1 ? "s" : ""} disponible
              {filteredPromotions.length > 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}