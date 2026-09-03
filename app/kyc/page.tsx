"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, ShieldCheck, Store, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function KycPage(){
 const router=useRouter(); const {user,profile,loading:authLoading,refreshProfile}=useAuth();
 const [saving,setSaving]=useState(false); const [message,setMessage]=useState(""); const [form,setForm]=useState({full_name:"",nationality:"",document_type:"Carte nationale d'identité",document_number:"",document_url:"",selfie_url:"",video_url:"",business_name:"",business_type:"",business_address:"",company_name:"",company_registration:""});
 useEffect(()=>{if(profile) setForm(f=>({...f,full_name:profile.nom||"",business_address:profile.adresse||""}));},[profile]);
 if(authLoading) return <main className="min-h-screen bg-black flex items-center justify-center"><LoadingSpinner/></main>;
 if(!user){router.replace("/auth"); return null;}
 const seller=profile?.role==="vendeur";
 async function submit(e:FormEvent){e.preventDefault();setSaving(true);setMessage("");try{
  const payload={user_id:user.id,role:profile?.role||"client",full_name:form.full_name,nationality:form.nationality,document_type:form.document_type,document_number:form.document_number,document_url:form.document_url||null,selfie_url:form.selfie_url||null,video_url:seller?form.video_url||null:null,business_name:seller?form.business_name||null:null,business_type:seller?form.business_type||null:null,business_address:seller?form.business_address||null:null,company_name:seller?form.company_name||null:null,company_registration:seller?form.company_registration||null:null,status:"en_attente",submitted_at:new Date().toISOString()};
  const {error}=await supabase.from("kyc_submissions").upsert(payload,{onConflict:"user_id"}); if(error) throw error;
  const {error:pe}=await supabase.from("profiles").update({kyc_status:"en_attente"}).eq("id",user.id); if(pe) throw pe;
  await refreshProfile(); setMessage("Votre demande KYC a été soumise avec succès. Un administrateur va la vérifier.");
 }catch(err:any){setMessage(err.message||"Impossible d'envoyer votre demande.");}finally{setSaving(false)}}
 return <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-3xl">
  <p className="font-bold text-orange-500">SÉCURITÉ DU COMPTE</p><h1 className="mt-2 text-3xl font-black">Vérification d'identité</h1>
  <p className="mt-2 text-zinc-400">{seller?"La vérification est obligatoire avant de publier et vendre sur Promo's World.":"Vérifiez votre identité pour débloquer les interactions sécurisées."}</p>
  <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm">{profile?.kyc_status==="verifie"?<span className="flex gap-2 text-green-400"><CheckCircle2/>Compte vérifié</span>:<>Statut actuel : <b>{profile?.kyc_status||"non_soumis"}</b></>}</div>
  <form onSubmit={submit} className="mt-6 space-y-6 rounded-3xl border border-white/10 bg-zinc-950 p-5 sm:p-8">
   <Section icon={<UserRound/>} title="Identité"><Grid><Input label="Nom complet" value={form.full_name} onChange={v=>setForm({...form,full_name:v})} required/><Input label="Nationalité" value={form.nationality} onChange={v=>setForm({...form,nationality:v})} required/><Input label="Type de document" value={form.document_type} onChange={v=>setForm({...form,document_type:v})} required/><Input label="Numéro du document" value={form.document_number} onChange={v=>setForm({...form,document_number:v})} required/></Grid></Section>
   <Section icon={<FileText/>} title="Documents et vérification"><Grid><Input label="Lien/photo du document (phase test)" value={form.document_url} onChange={v=>setForm({...form,document_url:v})}/><Input label="Lien/photo selfie (phase test)" value={form.selfie_url} onChange={v=>setForm({...form,selfie_url:v})}/>{seller&&<Input label="Lien vidéo visage (phase test)" value={form.video_url} onChange={v=>setForm({...form,video_url:v})}/>}</Grid></Section>
   {seller&&<Section icon={<Store/>} title="Informations vendeur / entreprise"><Grid><Input label="Nom de la boutique" value={form.business_name} onChange={v=>setForm({...form,business_name:v})} required/><Input label="Type d'activité" value={form.business_type} onChange={v=>setForm({...form,business_type:v})} required/><Input label="Adresse commerciale" value={form.business_address} onChange={v=>setForm({...form,business_address:v})}/><Input label="Entreprise (optionnel)" value={form.company_name} onChange={v=>setForm({...form,company_name:v})}/><Input label="N° d'enregistrement (optionnel)" value={form.company_registration} onChange={v=>setForm({...form,company_registration:v})}/></Grid></Section>}
   {message&&<div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm">{message}</div>}
   <button disabled={saving||profile?.kyc_status==="verifie"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black disabled:opacity-50"><ShieldCheck size={20}/>{saving?"Envoi...":profile?.kyc_status==="verifie"?"Compte déjà vérifié":"Soumettre ma vérification"}</button>
  </form></div></main>
}
function Section({icon,title,children}:{icon:any,title:string,children:any}){return <section><h2 className="mb-4 flex items-center gap-2 text-lg font-bold">{icon}{title}</h2>{children}</section>}
function Grid({children}:{children:any}){return <div className="grid gap-4 sm:grid-cols-2">{children}</div>}
function Input({label,value,onChange,required=false}:{label:string,value:string,onChange:(v:string)=>void,required?:boolean}){return <label className="block"><span className="mb-2 block text-sm text-zinc-400">{label}</span><input value={value} onChange={e=>onChange(e.target.value)} required={required} className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 outline-none focus:border-orange-500"/></label>}
