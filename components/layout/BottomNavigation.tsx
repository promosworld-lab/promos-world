"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Home,Store,Wallet,MessageCircle,User,LayoutDashboard,Boxes,Package} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";
import {useLanguage} from "@/hooks/useLanguage";

export default function BottomNavigation(){
 const pathname=usePathname(); const{user,isVendeur,isAdmin}=useAuth(); const{language}=useLanguage();
 if(isAdmin) return null;
 const items=user&&isVendeur
  ? (language==='en'?[{href:'/vendeur/dashboard',label:'Seller',icon:LayoutDashboard},{href:'/vendeur/produits',label:'Products',icon:Boxes},{href:'/vendeur/reservations',label:'Reservations',icon:Package},{href:'/vendeur/messages',label:'Messages',icon:MessageCircle},{href:'/profil',label:'Profile',icon:User}]:[{href:'/vendeur/dashboard',label:'Vendeur',icon:LayoutDashboard},{href:'/vendeur/produits',label:'Produits',icon:Boxes},{href:'/vendeur/reservations',label:'Réservations',icon:Package},{href:'/vendeur/messages',label:'Messages',icon:MessageCircle},{href:'/profil',label:'Profil',icon:User}])
  : (language==='en'?[{href:'/',label:'Home',icon:Home},{href:'/promo',label:'Market',icon:Store},{href:'/wallet',label:'Wallet',icon:Wallet,auth:true},{href:'/messages',label:'Messages',icon:MessageCircle,auth:true},{href:'/profil',label:'Profile',icon:User,auth:true}]:[{href:'/',label:'Accueil',icon:Home},{href:'/promo',label:'Marché',icon:Store},{href:'/wallet',label:'Wallet',icon:Wallet,auth:true},{href:'/messages',label:'Messages',icon:MessageCircle,auth:true},{href:'/profil',label:'Profil',icon:User,auth:true}]);
 return <nav className='fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur-xl md:hidden'><div className='mx-auto flex max-w-lg items-center justify-around px-2 py-2'>{items.map(i=>{if('auth'in i&&i.auth&&!user)return null;const I=i.icon;const a=pathname===i.href||(i.href!=='/'&&pathname.startsWith(i.href+'/'));return <Link key={i.href} href={i.href} className={'flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs '+(a?'text-orange-500':'text-zinc-500')}><I size={21}/><span>{i.label}</span></Link>})}</div></nav>
}
