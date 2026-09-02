"use client";

import { useState } from "react";
import { profileService } from "@/services/profile.service";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/types";

export function useProfile() {
  const { user, profile, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (
    updates: Partial<Profile>
  ) => {
    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      setLoading(true);
      setError(null);

      await profileService.updateProfile(user.id, updates);

      await refreshProfile();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    user,
    loading,
    error,
    updateProfile,
    refreshProfile,
  };
}