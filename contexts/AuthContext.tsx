"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface SignUpData {
  nom: string; email: string; password: string;
  telephone: string; adresse?: string;
  role: "client" | "vendeur"; pays: string; ville: string;
}
interface AuthContextType {
  user: User | null; profile: Profile | null; loading: boolean;
  isAuthenticated: boolean; isAdmin: boolean; isVendeur: boolean; isClient: boolean;
  signIn: (email:string,password:string)=>Promise<void>;
  signUp: (data:SignUpData)=>Promise<void>;
  signOut: ()=>Promise<void>; refreshProfile: ()=>Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}:{children:ReactNode}) {
  const [user,setUser]=useState<User|null>(null);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);

  const loadProfile=useCallback(async(userId:string)=>{
    const {data,error}=await supabase.from("profiles").select("*").eq("id",userId).maybeSingle();
    if(error) throw new Error(error.message);
    setProfile((data as Profile|null) ?? null);
  },[]);

  const refreshProfile=useCallback(async()=>{ if(user?.id) await loadProfile(user.id); },[user,loadProfile]);

  useEffect(()=>{
    let mounted=true;
    const initialize=async()=>{
      try {
        const {data:{session},error}=await supabase.auth.getSession();
        if(error) throw error;
        if(!mounted) return;
        const current=session?.user ?? null;
        setUser(current);
        if(current) await loadProfile(current.id);
      } catch(error) {
        console.error("Auth initialization error:",error);
        if(mounted) { setUser(null); setProfile(null); }
      } finally { if(mounted) setLoading(false); }
    };
    initialize();

    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      const current=session?.user ?? null;
      setUser(current);
      if(!current) setProfile(null);
      if(current && event !== "INITIAL_SESSION") {
        setTimeout(()=>loadProfile(current.id).catch(console.error),0);
      }
      setLoading(false);
    });
    return ()=>{mounted=false;subscription.unsubscribe();};
  },[loadProfile]);

  const signIn=async(email:string,password:string)=>{
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw new Error(error.message);
    setUser(data.user);
    if(data.user) await loadProfile(data.user.id);
  };

  const signUp=async(payload:SignUpData)=>{
    const {nom,email,password,telephone,adresse,role,pays,ville}=payload;
    const {data,error}=await supabase.auth.signUp({
      email,password,
      options:{data:{nom,role,pays,ville}}
    });
    if(error) throw new Error(error.message);
    if(!data.user) throw new Error("Impossible de créer le compte.");

    const {error:profileError}=await supabase.from("profiles").upsert({
      id:data.user.id, nom, email, telephone:telephone.trim(), adresse:adresse||"",
      role,pays,ville,kyc_status:"non_soumis"
    },{onConflict:"id"});
    if(profileError) throw new Error(profileError.message);

    if (data.session) {
      setUser(data.user);
      await loadProfile(data.user.id);
    }
  };

  const signOut=async()=>{
    const {error}=await supabase.auth.signOut();
    if(error) throw new Error(error.message);
    setUser(null);setProfile(null);
  };

  return <AuthContext.Provider value={{
    user,profile,loading,isAuthenticated:!!user,
    isAdmin:profile?.role==="admin",isVendeur:profile?.role==="vendeur",isClient:profile?.role==="client",
    signIn,signUp,signOut,refreshProfile
  }}>{children}</AuthContext.Provider>;
}