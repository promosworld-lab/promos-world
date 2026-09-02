"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";

export default function WalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [solde, setSolde] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallet = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const items = data || [];

      setTransactions(items);

      if (items.length > 0) {
        setSolde(Number(items[0].solde_apres || 0));
      }

      setLoading(false);
    };

    loadWallet();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">Mon Wallet</h1>

        <Card className="mb-8 border-orange-500/40">
          <p className="text-zinc-400">Solde disponible</p>

          <h2 className="text-4xl font-bold text-orange-500 mt-3">
            {solde.toLocaleString()} FCFA
          </h2>

          <p className="text-xs text-zinc-500 mt-4">
            🧪 Wallet actuellement utilisé en mode simulation.
          </p>
        </Card>

        <h2 className="text-xl font-bold mb-4">
          Historique
        </h2>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card>
              <p className="text-zinc-400 text-center">
                Aucune transaction wallet.
              </p>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>
                <div className="flex justify-between gap-4">

                  <div>
                    <p className="font-semibold">
                      {transaction.description ||
                        transaction.type}
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(
                        transaction.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-orange-500">
                      {Number(
                        transaction.montant
                      ).toLocaleString()}{" "}
                      FCFA
                    </p>

                    <p className="text-xs text-zinc-500">
                      Solde :{" "}
                      {Number(
                        transaction.solde_apres
                      ).toLocaleString()}
                    </p>
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </main>
  );
}