"use client";

import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface Conversation {
  userId: string;
  nom: string;
  dernierMessage: string;
  createdAt: string;
  nonLus: number;
}

export default function MessagesPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        setLoading(true);

        const { data: messages, error } = await supabase
          .from("messages")
          .select(`
            id,
            expediteur_id,
            destinataire_id,
            contenu,
            lu,
            created_at
          `)
          .or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const conversationMap = new Map<string, Conversation>();

        for (const message of messages || []) {
          const otherUserId =
            message.expediteur_id === user.id
              ? message.destinataire_id
              : message.expediteur_id;

          if (!conversationMap.has(otherUserId)) {
            conversationMap.set(otherUserId, {
              userId: otherUserId,
              nom: "Utilisateur",
              dernierMessage: message.contenu,
              createdAt: message.created_at,
              nonLus:
                message.destinataire_id === user.id && !message.lu ? 1 : 0,
            });
          } else {
            const conversation = conversationMap.get(otherUserId)!;

            if (
              message.destinataire_id === user.id &&
              !message.lu
            ) {
              conversation.nonLus += 1;
            }
          }
        }

        const userIds = [...conversationMap.keys()];

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, nom")
            .in("id", userIds);

          profiles?.forEach((profile) => {
            const conversation = conversationMap.get(profile.id);

            if (conversation) {
              conversation.nom =
                profile.nom || "Utilisateur";
            }
          });
        }

        setConversations(
          [...conversationMap.values()].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
        );
      } catch (error) {
        console.error("Erreur conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  const filteredConversations = useMemo(() => {
    const query = search.toLowerCase();

    return conversations.filter(
      (conversation) =>
        conversation.nom.toLowerCase().includes(query) ||
        conversation.dernierMessage.toLowerCase().includes(query)
    );
  }, [conversations, search]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-24 pt-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-500">
            COMMUNICATION
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Messages
          </h1>

          <p className="mt-2 text-zinc-500">
            Retrouvez toutes vos conversations.
          </p>
        </div>

        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-4 pl-12 pr-4 outline-none transition focus:border-orange-500"
          />
        </div>

        {filteredConversations.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={48} />}
            title="Aucune conversation"
            description="Vos conversations avec les vendeurs et clients apparaîtront ici."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
            {filteredConversations.map((conversation) => (
              <Link
                key={conversation.userId}
                href={`/chat/${conversation.userId}`}
                className="flex items-center gap-4 border-b border-zinc-800 p-4 transition last:border-0 hover:bg-zinc-900"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-black">
                  {conversation.nom.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="truncate font-semibold">
                      {conversation.nom}
                    </h2>

                    <span className="shrink-0 text-xs text-zinc-600">
                      {new Date(
                        conversation.createdAt
                      ).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-3">
                    <p className="truncate text-sm text-zinc-500">
                      {conversation.dernierMessage}
                    </p>

                    {conversation.nonLus > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-bold text-black">
                        {conversation.nonLus}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}