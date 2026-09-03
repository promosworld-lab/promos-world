"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, PackageOpen, Plus, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { usePromotions } from "@/hooks/usePromotions";
import { PromotionCard } from "@/components/promotion/PromotionCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function PromoPage() {
  const { language } = useLanguage();
  const { promotions,loading,error,refresh }=usePromotions();
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");

  const text=language==="en"?{
    title:"Marketplace",subtitle:"Discover products and special offers available near you.",
    add:"Add a listing",search:"Search products or promotions...",all:"All",
    none:"No listing found",noneText:"Try another search, category, or come back later.",
    retry:"Try again",count:"available listing"
  }:{
    title:"Marketplace",subtitle:"Découvrez des articles et des promotions disponibles près de chez vous.",
    add:"Ajouter une publication",search:"Rechercher un article ou une promotion...",all:"Toutes",
    none:"Aucune publication trouvée",noneText:"Essayez une autre recherche, catégorie ou revenez plus tard.",
    retry:"Réessayer",count:"publication disponible"
  };

  const categories=useMemo(()=>[...new Set(promotions.map(p=>p.categorie).filter(Boolean))], [promotions]);
  const filtered=useMemo(()=>promotions.filter(p=>{
    const q=search.toLowerCase();
    return (!q || p.titre.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q)||p.categorie?.toLowerCase().includes(q))
      && (category==="all"||p.categorie===category);
  }),[promotions,search,category]);

  return <main className="min-h-screen bg-black px-4 pb-24 pt-6 text-white sm:px-6 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-sm font-medium text-orange-500">PROMO’S WORLD</p><h1 className="text-3xl font-bold sm:text-4xl">{text.title}</h1><p className="mt-2 text-sm text-zinc-400 sm:text-base">{text.subtitle}</p></div>
        <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black"><Plus size={18}/>{text.add}</Link>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1"><Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={text.search} className="w-full rounded-xl border border-zinc-800 bg-black py-3 pl-12 pr-4 outline-none focus:border-orange-500"/></div>
          <div className="flex items-center gap-2 overflow-x-auto"><SlidersHorizontal size={18} className="text-zinc-500"/><button onClick={()=>setCategory("all")} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm ${category==="all"?"bg-orange-500 text-black":"bg-zinc-900 text-zinc-300"}`}>{text.all}</button>{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm ${category===item?"bg-orange-500 text-black":"bg-zinc-900 text-zinc-300"}`}>{item}</button>)}</div>
        </div>
      </div>

      {loading ? <div className="flex min-h-[300px] items-center justify-center"><LoadingSpinner text={language==="en"?"Loading marketplace...":"Chargement du marketplace..."}/></div>
      : error ? <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center"><p className="text-red-300">{error}</p><button onClick={refresh} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"><RefreshCw size={17}/>{text.retry}</button></div>
      : filtered.length===0 ? <EmptyState icon={<PackageOpen size={42}/>} title={text.none} description={text.noneText} action={<button onClick={refresh} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">{text.retry}</button>}/>
      : <><p className="mb-5 text-sm text-zinc-500">{filtered.length} {text.count}{filtered.length>1?"s":""}</p><div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(p=><PromotionCard key={p.id} promotion={p}/>)}</div></>}
    </div>
  </main>;
}