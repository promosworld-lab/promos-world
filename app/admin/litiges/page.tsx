"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/common/Loading";

export default function AdminLitigesPage() {
  const [litiges, setLitiges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLitiges = async () => {
    const { data } = await supabase
      .from("litiges")
      .select(`
        *,
        promotions (titre)
      `)
      .order("created_at", { ascending: false });

    setLitiges(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadLitiges();
  }, []);

  const updateLitige = async (
    id: string,
    statut: string,
    decision_admin: string
  ) => {
    await supabase
      .from("litiges")
      .update({
        statut,
        decision_admin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    loadLitiges();
  };

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Gestion des litiges
        </h1>

        <div className="space-y-5">

          {litiges.length === 0 ? (
            <Card>
              <p className="text-center text-zinc-400">
                Aucun litige.
              </p>
            </Card>
          ) : (
            litiges.map((litige) => (
              <Card key={litige.id} className="space-y-5">

                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="font-bold">
                      {litige.promotions?.titre ||
                        "Litige transaction"}
                    </h2>

                    <p className="text-zinc-400 mt-2">
                      {litige.motif}
                    </p>
                  </div>

                  <span className="text-orange-400">
                    {litige.statut}
                  </span>
                </div>

                {litige.decision_admin && (
                  <div className="bg-zinc-900 p-4 rounded-xl">
                    <p className="text-sm text-zinc-500">
                      Décision précédente
                    </p>

                    <p className="mt-1">
                      {litige.decision_admin}
                    </p>
                  </div>
                )}

                {litige.statut === "ouvert" && (
                  <div className="flex flex-col sm:flex-row gap-3">

                    <Button
                      onClick={() =>
                        updateLitige(
                          litige.id,
                          "resolu",
                          "Litige résolu après examen par l'administration."
                        )
                      }
                    >
                      ✅ Résoudre
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() =>
                        updateLitige(
                          litige.id,
                          "rejete",
                          "Demande rejetée après examen du dossier."
                        )
                      }
                    >
                      ❌ Rejeter
                    </Button>

                  </div>
                )}

              </Card>
            ))
          )}

        </div>
      </div>
    </main>
  );
}