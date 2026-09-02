"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Card from "@/components/ui/Card";
import Loading from "@/components/common/Loading";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select(`
          *,
          promotions (titre)
        `)
        .order("created_at", { ascending: false });

      setTransactions(data || []);
      setLoading(false);
    };

    loadTransactions();
  }, []);

  if (loading) return <Loading />;

  const total = transactions.reduce(
    (sum, transaction) =>
      sum + Number(transaction.montant_total || 0),
    0
  );

  const bloquees = transactions.filter(
    (transaction) => transaction.statut === "bloque"
  ).length;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Transactions
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <Card>
            <p className="text-zinc-400">Volume total</p>

            <p className="text-2xl font-bold text-orange-500 mt-2">
              {total.toLocaleString()} FCFA
            </p>
          </Card>

          <Card>
            <p className="text-zinc-400">
              Transactions bloquées
            </p>

            <p className="text-2xl font-bold mt-2">
              {bloquees}
            </p>
          </Card>

        </div>

        <div className="space-y-4">

          {transactions.length === 0 ? (
            <Card>
              <p className="text-center text-zinc-400">
                Aucune transaction.
              </p>
            </Card>
          ) : (
            transactions.map((transaction) => (
              <Card key={transaction.id}>

                <div className="flex flex-col md:flex-row justify-between gap-4">

                  <div>
                    <h2 className="font-bold">
                      {transaction.promotions?.titre ||
                        "Transaction"}
                    </h2>

                    <p className="text-sm text-zinc-500 mt-1">
                      ID : {transaction.id}
                    </p>

                    <p className="text-sm text-zinc-500 mt-1">
                      {new Date(
                        transaction.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="md:text-right">

                    <p className="font-bold text-orange-500 text-xl">
                      {Number(
                        transaction.montant_total
                      ).toLocaleString()}{" "}
                      FCFA
                    </p>

                    <p className="text-zinc-400 mt-1">
                      {transaction.statut}
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