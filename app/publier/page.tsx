"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LockKeyhole, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function PublierPage(){
 const router=useRouter(); const {user,profile,loading}=useAuth(); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
 const [f,setF]=useState({type:"article",titre:"",description:"",categorie:"Autres",prix_original:"",prix_promo:"",stock:"1",photo_url:"",pays:"",ville:"",delai_livraison_jours:""});
 useEffect(()=>{if(profile)setF(x=>({...x,pays:profile.pays||"",ville:profile.ville||""}));},[profile]);
 if(loading)return <main className="min-h-screen bg-black flex items-center justify-center"><LoadingSpinner/></main>;
 if(!user){router.replace("/auth");return null}
 const verified=profile?.role==="vendeur"&&profile?.kyc_status==="verifie";
 async function submit(e:FormEvent){e.preventDefault();if(!verified)return;setSaving(true);setMessage("");try{const normal=Number(f.prix_original);const sale=f.type==="promotion"?Number(f.prix_promo):normal; const {error}=await supabase.from("promotions").insert({vendeur_id:user.id,titre:f.titre,description:f.description||null,categorie:f.categorie,publication_type:f.type,prix_original:normal,prix_promo:sale,stock:Number(f.stock),photo_url:f.photo_url||null,pays:f.pays||null,ville:f.ville||null,delai_livraison_jours:f.delai_livraison_jours?Number(f.delai_livraison_jours):null,statut:"en_attente"});if(error)throw error;router.push("/dashboard")}catch(err:any){setMessage(err.message||"Publication impossible.");}finally{setSaving(false)}}
 return <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-3xl"><p className="font-bold text-orange-500">VENDEUR</p><h1 className="mt-2 text-3xl font-black">Publier sur le marketplace</h1>
 {!verified?<div className="mt-6 rounded-3xl border border-orange-500/30 bg-orange-500/10 p-7"><LockKeyhole className="text-orange-500"/><h2 className="mt-4 text-xl font-bold">Vérification obligatoire</h2><p className="mt-2 text-zinc-300">Votre compte vendeur doit être vérifié avant toute publication.</p><button onClick={()=>router.push("/kyc")} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black">Faire ma vérification</button></div>:<form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-8">
 <div className="grid grid-cols-2 gap-3">{["article","promotion"].map(type=><button type="button" key={type} onClick={()=>setF({...f,type})} className={"rounded-xl border p-4 font-bold "+(f.type===type?"border-orange-500 bg-orange-500/10 text-orange-400":"border-white/10")}>{type==="article"?"Article normal":"Promotion"}</button>)}</div>
 <Input label="Titre" value={f.titre} set={v=>setF({...f,titre:v})} required/><Text label="Description" value={f.description} set={v=>setF({...f,description:v})}/><div className="grid gap-4 sm:grid-cols-2"><Input label="Catégorie" value={f.categorie} set={v=>setF({...f,categorie:v})}/><Input label="Stock" type="number" value={f.stock} set={v=>setF({...f,stock:v})} required/></div>
 <div className="grid gap-4 sm:grid-cols-2"><Input label={f.type==="promotion"?"Prix original":"Prix"} type="number" value={f.prix_original} set={v=>setF({...f,prix_original:v})} required/>{f.type==="promotion"&&<Input label="Prix promotion" type="number" value={f.prix_promo} set={v=>setF({...f,prix_promo:v})} required/>}</div>
 <Input label="URL de l'image (phase test)" value={f.photo_url} set={v=>setF({...f,photo_url:v})}/><div className="grid gap-4 sm:grid-cols-2"><Input label="Pays" value={f.pays} set={v=>setF({...f,pays:v})}/><Input label="Ville" value={f.ville} set={v=>setF({...f,ville:v})}/></div><Input label="Délai livraison (jours)" type="number" value={f.delai_livraison_jours} set={v=>setF({...f,delai_livraison_jours:v})}/>
 {message&&<p className="rounded-xl bg-red-500/10 p-4 text-red-300">{message}</p>}<button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black"><Send size={19}/>{saving?"Publication...":"Envoyer la publication"}</button>
 </form>}</div></main>
}
function Input({label,value,set,type="text",required=false}:{label:string,value:string,set:(v:string)=>void,type?:string,required?:boolean}){return <label className="block"><span className="mb-2 block text-sm text-zinc-400">{label}</span><input type={type} value={value} onChange={e=>set(e.target.value)} required={required} className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>}
function Text({label,value,set}:{label:string,value:string,set:(v:string)=>void}){return <label className="block"><span className="mb-2 block text-sm text-zinc-400">{label}</span><textarea value={value} onChange={e=>set(e.target.value)} className="min-h-28 w-full rounded-xl border border-white/10 bg-black p-4 outline-none focus:border-orange-500"/></label>}
