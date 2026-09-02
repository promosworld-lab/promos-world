"use client";

import {
  createContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types";

interface SignUpData {
  nom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  role?: "client" | "vendeur";
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;

  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendeur: boolean;
  isClient: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    data: SignUpData
  ) => Promise<void>;

  signOut: () => Promise<void>;

  refreshProfile: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(
        "Erreur récupération profil:",
        error
      );

      setProfile(null);
      return;
    }

    setProfile(data as Profile);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;

    await loadProfile(user.id);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        }
      } catch (error) {
        console.error(
          "Erreur initialisation auth:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser =
          session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          await loadProfile(currentUser.id);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string
  ) => {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;
  };

  const signUp = async ({
    nom,
    email,
    password,
    telephone,
    adresse,
    role = "client",
  }: SignUpData) => {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) throw error;

    if (!data.user) {
      throw new Error(
        "Impossible de créer le compte."
      );
    }

    /*
      Création du profil.

      Plus tard, on pourra automatiser ça
      complètement avec un trigger Supabase.
    */

    const { error: profileError } =
      await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          nom,
          email,
          telephone: telephone || "",
          adresse: adresse || "",
          role,
        });

    if (profileError) {
      console.error(
        "Erreur création profil:",
        profileError
      );
    }
  };

  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
    setProfile(null);
  };

  const isAuthenticated = !!user;

  const isAdmin =
    profile?.role === "admin";

  const isVendeur =
    profile?.role === "vendeur";

  const isClient =
    profile?.role === "client";

  return (
    <AuthContext.Provider
  value={{
    user,
    profile,
    loading,

    isAuthenticated,
    isAdmin,
    isVendeur,
    isClient,

    signIn,
    signUp,
    signOut,

    refreshProfile,
  }}
    >
      {children}
    </AuthContext.Provider>
  );
}