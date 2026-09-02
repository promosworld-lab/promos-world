import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export const profilesService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erreur récupération profil:", error);
      return null;
    }

    return data;
  },

  async update(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async getCurrentUser(): Promise<Profile | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    return this.getById(user.id);
  },

  async getCurrentAuthUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  },
};