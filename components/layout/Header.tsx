"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu,X,Home,Store,Wallet,User,MessageCircle,Shield,LogOut,Globe,LayoutDashboard,PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

export default function Header(){
 const pathname=usePathname(); const router=useRouter();
 const [menuOpen,setMenuOpen]=useState(false); const [profileOpen,setProfileOpen]=useState(false);
 const {user,profile,loading,isAdmin,isVendeur,signOut}=useAuth(); const {language,toggleLanguage}=useLanguage();
 const tr=language==="en"?{home:"Home",market:"Marketplace",messages:"Messages",dashboard:"Dashboard",admin:"Admin",login:"Sign in",profile:"My profile",wallet:"Wallet",logout:"Sign out",publish:"Publish",account:"Account"}:{home:"Accueil",market:"Marketplace",messages:"Messages",dashboard:"Tableau de bord",admin:"Administration",login:"Connexion",profile:"Mon profil",wallet:"Portefeuille",logout:"Déconnexion",publish:"Publier",account:"Compte"};
 const nav=[{label:tr.home,href:"/",icon:Home},{label:tr.market,href:"/promo",icon:Store},{label:tr.messages,href:"/messages",icon:MessageCircle,auth:true}];
 if(isVendeur) nav.push({label:tr.dashboard,href:"/dashboard",icon:LayoutDashboard,auth:true});
 if(isAdmin) nav.push({label:tr.admin,href:"/admin",icon:Shield,auth:true});
 const active=(href:string)=>pathname===href||(href!=="/"&&pathname.startsWith(href+"/"));
 const logout=async()=>{await signOut();router.replace("/")};
 return <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
  <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
   <Link href="/" className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-black">P</span><span className="hidden text-lg font-black sm:block">Promo's World</span></Link>
   <nav className="hidden items-center gap-1 md:flex">{nav.map(i=>{if(i.auth&&!user)return null;const I=i.icon;return <Link key={i.href} href={i.href} className={"flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition "+(active(i.href)?"bg-orange-500 text-black":"text-zinc-400 hover:bg-white/5 hover:text-white")}><I size={17}/>{i.label}</Link>})}</nav>
   <div className="flex items-center gap-2">
    {user&&isVendeur&&<Link href="/publier" className="hidden items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-bold text-black sm:flex"><PlusCircle size={17}/>{tr.publish}</Link>}
    <button onClick={toggleLanguage} className="flex h-10 items-center gap-2 rounded-xl px-3 text-sm text-zinc-300 hover:bg-white/10" aria-label="Change language"><Globe size={18}/><span className="uppercase">{language}</span></button>
    {!loading&&!user&&<Link href="/auth" className="hidden rounded-xl bg-orange-500 px-4 py-2 font-bold text-black sm:block">{tr.login}</Link>}
    {!loading&&user&&<div className="relative"><button onClick={()=>setProfileOpen(v=>!v)} className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 font-bold text-orange-500">{(profile?.nom||user.email||"U").charAt(0).toUpperCase()}</button>{profileOpen&&<div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl"><div className="border-b border-white/10 px-3 py-3"><p className="font-semibold">{profile?.nom||tr.account}</p><p className="truncate text-xs text-zinc-500">{user.email}</p></div><Link href="/profil" onClick={()=>setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/10"><User size={18}/>{tr.profile}</Link><Link href="/wallet" onClick={()=>setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-white/10"><Wallet size={18}/>{tr.wallet}</Link><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"><LogOut size={18}/>{tr.logout}</button></div>}</div>}
    <button onClick={()=>setMenuOpen(v=>!v)} className="flex h-10 w-10 items-center justify-center rounded-xl md:hidden">{menuOpen?<X/>:<Menu/>}</button>
   </div>
  </div>
  {menuOpen&&<div className="border-t border-white/10 bg-zinc-950 p-4 md:hidden"><nav className="flex flex-col gap-2">{nav.map(i=>{if(i.auth&&!user)return null;const I=i.icon;return <Link key={i.href} href={i.href} onClick={()=>setMenuOpen(false)} className={"flex items-center gap-3 rounded-xl px-4 py-3 "+(active(i.href)?"bg-orange-500 text-black":"text-zinc-300 hover:bg-white/10")}><I size={20}/>{i.label}</Link>})}{user&&isVendeur&&<Link href="/publier" onClick={()=>setMenuOpen(false)} className="flex items-center gap-3 rounded-xl bg-orange-500 px-4 py-3 font-bold text-black"><PlusCircle size={20}/>{tr.publish}</Link>}{!user&&<Link href="/auth" onClick={()=>setMenuOpen(false)} className="rounded-xl bg-orange-500 px-4 py-3 text-center font-bold text-black">{tr.login}</Link>}</nav></div>}
 </header>
}