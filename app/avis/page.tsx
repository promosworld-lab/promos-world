'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { avisService } from '@/lib/services/avis.service';

export default function AvisPage() {
  const { user } = useAuth();

  const [avis, setAvis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState('');

  async function loadData() {
    if (!user) return;

    try {
      setLoading(true);

      const data = await avisService.getByUser(user.id);
      setAvis(data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!commentaire.trim()) return;

    setSaving(true);

    /*
      L'ajout réel d'un avis dépend d'une réservation terminée.
      On finalisera la liaison exacte après la configuration
      Supabase finale.
    */

    setTimeout(() => {
      setCommentaire('');
      setSaving(false);
    }, 500);
  }

  if (loading) return <Loading />;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-bold text-orange-500">COMMUNAUTÉ</p>
        <h1 className="mt-2 text-3xl font-black text-white">Avis</h1>
        <p className="mt-2 text-zinc-500">
          Consultez les évaluations et partagez votre expérience après vos achats.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">
            <MessageSquarePlus size={22} />
          </div>

          <div>
            <h2 className="font-bold text-white">Partager une expérience</h2>
            <p className="text-sm text-zinc-500">
              Les avis sont liés aux transactions terminées.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setNote(value)}
                className="transition"
              >
                <Star
                  size={28}
                  className={
                    value <= note
                      ? 'fill-orange-500 text-orange-500'
                      : 'text-zinc-700'
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            value={commentaire}
            onChange={(event) => setCommentaire(event.target.value)}
            placeholder="Partagez votre expérience..."
            className="mt-5 min-h-28 w-full rounded-xl border border-white/10 bg-black p-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-orange-500"
          />

          <button
            disabled={saving}
            className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-bold text-black disabled:opacity-50"
          >
            {saving ? 'Publication...' : 'Publier mon avis'}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-white">Vos avis</h2>

        {avis.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              title="Aucun avis pour le moment"
              description="Vos avis apparaîtront ici après vos transactions terminées."
            />
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {avis.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={17}
                        className={
                          star <= item.note
                            ? 'fill-orange-500 text-orange-500'
                            : 'text-zinc-700'
                        }
                      />
                    ))}
                  </div>

                  <span className="text-xs text-zinc-600">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {item.commentaire && (
                  <p className="mt-4 leading-7 text-zinc-400">
                    {item.commentaire}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}