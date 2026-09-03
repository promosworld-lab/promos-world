"use client";

import { useState } from "react";
import { profilesService } from "@/lib/services/profiles.service";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/types";

export function useProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("Utilisateur non connecté");
    try {
      setLoading(true);
      setError(null);
      await profilesService.update(user.id, updates);
      await refreshProfile();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, user, loading, error, updateProfile, refreshProfile };
}
