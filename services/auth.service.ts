import { supabase } from "@/lib/supabase/client";

export const authService = {
  async signUp({
    email,
    password,
    nom,
    telephone,
  }: {
    email: string;
    password: string;
    nom: string;
    telephone?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          telephone: telephone || "",
        },
      },
    });

    if (error) throw error;

    return data;
  },

  async signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;
  },
};