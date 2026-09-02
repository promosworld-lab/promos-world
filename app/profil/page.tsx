"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Shield,
  Globe,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProfileData {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  role: string;
}

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] =
    useState<ProfileData>({
      nom: "",
      email: "",
      telephone: "",
      adresse: "",
      role: "client",
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            nom: data.nom || "",
            email: data.email || user.email || "",
            telephone: data.telephone || "",
            adresse: data.adresse || "",
            role: data.role || "client",
          });
        }
      } catch (error) {
        console.error("Erreur profil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const saveProfile = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!user || saving) return;

    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase
        .from("profiles")
        .update({
          nom: profile.nom.trim(),
          telephone: profile.telephone.trim(),
          adresse: profile.adresse.trim(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage("Profil mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur sauvegarde profil:", error);
      setMessage(
        "Une erreur est survenue lors de la mise à jour."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-24 pt-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-500">
            MON COMPTE
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Mon profil
          </h1>

          <p className="mt-2 text-zinc-500">
            Gérez vos informations personnelles et vos préférences.
          </p>
        </div>

        {/* PROFILE HEADER */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
          <div className="h-24 bg-gradient-to-r from-orange-500/30 to-orange-900/10" />

          <div className="px-6 pb-6">
            <div className="-mt-12 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-zinc-950 bg-orange-500 text-3xl font-bold text-black">
              {profile.nom
                ? profile.nom.charAt(0).toUpperCase()
                : <User />}
            </div>

            <h2 className="mt-4 text-xl font-bold">
              {profile.nom || "Utilisateur"}
            </h2>

            <p className="mt-1 text-zinc-500">
              {profile.email}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
              <Shield size={16} />
              Compte {profile.role}
            </div>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={saveProfile}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7"
        >
          <h2 className="mb-6 text-xl font-bold">
            Informations personnelles
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              icon={<User size={19} />}
              label="Nom complet"
              value={profile.nom}
              onChange={(value) =>
                setProfile({
                  ...profile,
                  nom: value,
                })
              }
              required
            />

            <Field
              icon={<Mail size={19} />}
              label="Adresse email"
              value={profile.email}
              disabled
            />

            <Field
              icon={<Phone size={19} />}
              label="Téléphone"
              value={profile.telephone}
              onChange={(value) =>
                setProfile({
                  ...profile,
                  telephone: value,
                })
              }
            />

            <Field
              icon={<MapPin size={19} />}
              label="Adresse"
              value={profile.adresse}
              onChange={(value) =>
                setProfile({
                  ...profile,
                  adresse: value,
                })
              }
            />
          </div>

          {message && (
            <div className="mt-6 rounded-xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-bold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save size={19} />

            {saving
              ? "Enregistrement..."
              : "Enregistrer les modifications"}
          </button>
        </form>

        {/* PREFERENCES */}
        <div className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-zinc-900 p-3 text-orange-500">
              <Globe size={22} />
            </div>

            <div>
              <h2 className="font-bold">
                Langue de l&apos;application
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Vous pourrez utiliser Promo&apos;s World en français ou en anglais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm text-zinc-400">
        {label}
      </span>

      <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-black px-4 transition focus-within:border-orange-500">
        <span className="text-zinc-500">
          {icon}
        </span>

        <input
          value={value}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
          required={required}
          disabled={disabled}
          className="w-full bg-transparent py-4 text-sm outline-none disabled:cursor-not-allowed disabled:text-zinc-600"
        />
      </div>
    </label>
  );
}