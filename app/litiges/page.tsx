'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Plus,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { litigesService } from '@/lib/services/litiges.service';

export default function LitigesPage() {
  const { user } = useAuth();

  const [litiges, setLitiges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [motif, setMotif] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadLitiges() {
    if (!user) return;

    try {
      setLoading(true);
      const data = await litigesService.getByClient(user.id);
      setLitiges(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLitiges();
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!motif.trim()) return;

    /*
      La création complète sera définitivement reliée à une transaction
      lors du bloc Supabase final.
    */

    setSaving(true);

    setTimeout(() => {
      setMotif('');
      setSaving(false);
      setShowForm(false);
    }, 500);
  }

  function getStatus(statut: string) {
    const statuses: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      ouvert: {
        label: 'Ouvert',
        className: 'bg-orange-500/10 text-orange-400',
        icon: AlertTriangle,
      },
      en_cours: {
        label: 'En cours',
        className: 'bg-blue-500/10 text-blue-400',
        icon: Clock3,
      },
      resolu: {
        label: 'Résolu',
        className: 'bg-green-500/10 text-green-400',
        icon: CheckCircle2,
      },
      rejete: {
        label: 'Rejeté',
        className: 'bg-red-500/10 text-red-400',
        icon: AlertTriangle,
      },
    };

    return statuses[statut] || statuses.ouvert;
  }

  if (loading) return <Loading />;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-orange-500">ASSISTANCE</p>
          <h1 className="mt-2 text-3xl font-black text-white">Litiges</h1>
          <p className="mt-2 text-zinc-500">
            Suivez les problèmes signalés concernant vos transactions.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black"
        >
          <Plus size={19} />
          Ouvrir un litige
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/[0.04] p-5"
        >
          <h2 className="font-bold text-white">Décrire le problème</h2>

          <textarea
            value={motif}
            onChange={(event) => setMotif(event.target.value)}
            required
            placeholder="Expliquez clairement votre problème..."
            className="mt-4 min-h-32 w-full rounded-xl border border-white/10 bg-black p-4 text-sm outline-none focus:border-orange-500"
          />

          <div className="mt-4 flex gap-3">
            <button
              disabled={saving}
              className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-black"
            >
              {saving ? 'Envoi...' : 'Envoyer'}
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-white/10 px-5 py-3 text-zinc-400"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {litiges.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Aucun litige"
            description="Vous n'avez actuellement aucun litige ouvert."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {litiges.map((litige) => {
            const status = getStatus(litige.statut);
            const Icon = status.icon;

            return (
              <article
                key={litige.id}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="font-bold text-white">Litige #{litige.id.slice(0, 8)}</h2>

                    <p className="mt-3 leading-7 text-zinc-400">
                      {litige.motif}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
                  >
                    <Icon size={14} />
                    {status.label}
                  </span>
                </div>

                {litige.decision_admin && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black p-4">
                    <p className="text-xs font-bold uppercase text-zinc-600">
                      Décision
                    </p>
                    <p className="mt-2 text-sm text-zinc-300">
                      {litige.decision_admin}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}