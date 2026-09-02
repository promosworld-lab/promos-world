"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("transactions")
        .select(`
          *,
          promotions (titre)
        `)
        .or(`client_id.eq.${user.id},vendeur_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      setTransactions(data || []);
      setLoading(false);
    };

    loadTransactions();
  }, []);

  if (loading) return <Loading />;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Transactions
        </h1>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <p className="text-zinc-400 text-center">
                Aucune transaction.
              </p>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  <div>
                    <h2 className="font-bold">
                      {transaction.promotions?.titre ||
                        "Transaction Promo's World"}
                    </h2>

                    <p className="text-sm text-zinc-500 mt-1">
                      {new Date(
                        transaction.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-lg font-bold text-orange-500">
                      {Number(
                        transaction.montant_total
                      ).toLocaleString()}{" "}
                      FCFA
                    </p>

                    <span className="text-sm text-zinc-400">
                      {transaction.statut}
                    </span>
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