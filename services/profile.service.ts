import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data as Profile;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return data as Profile;
  },

  async getPublicProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nom, telephone, role, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data;
  },
};