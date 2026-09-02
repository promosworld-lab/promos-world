"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  User,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Message {
  id: string;
  expediteur_id: string;
  destinataire_id: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

export default function ChatPage() {
  const params = useParams();
  const vendeurId = params.vendeurId as string;

  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] =
    useState("Utilisateur");

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !vendeurId) return;

    const loadChat = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("nom")
          .eq("id", vendeurId)
          .single();

        if (profile?.nom) {
          setOtherUserName(profile.nom);
        }

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(expediteur_id.eq.${user.id},destinataire_id.eq.${vendeurId}),and(expediteur_id.eq.${vendeurId},destinataire_id.eq.${user.id})`
          )
          .order("created_at", {
            ascending: true,
          });

        if (error) throw error;

        setMessages(data || []);

        await supabase
          .from("messages")
          .update({ lu: true })
          .eq("expediteur_id", vendeurId)
          .eq("destinataire_id", user.id)
          .eq("lu", false);
      } catch (error) {
        console.error("Erreur chat:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    const channel = supabase
      .channel(`chat-${user.id}-${vendeurId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as Message;

          const belongsToConversation =
            (message.expediteur_id === user.id &&
              message.destinataire_id === vendeurId) ||
            (message.expediteur_id === vendeurId &&
              message.destinataire_id === user.id);

          if (belongsToConversation) {
            setMessages((previous) => [
              ...previous,
              message,
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, vendeurId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    const trimmedContent = content.trim();

    if (!trimmedContent || !user || sending) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from("messages")
        .insert({
          expediteur_id: user.id,
          destinataire_id: vendeurId,
          contenu: trimmedContent,
        });

      if (error) throw error;

      setContent("");
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col bg-black text-white">
      {/* HEADER */}
      <header className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-950 px-4 py-4">
        <button
          onClick={() => window.history.back()}
          className="rounded-xl p-2 transition hover:bg-zinc-900"
          aria-label="Retour"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-black">
          <User size={21} />
        </div>

        <div>
          <h1 className="font-bold">
            {otherUserName}
          </h1>

          <p className="text-xs text-zinc-500">
            Conversation sécurisée
          </p>
        </div>
      </header>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          {messages.map((message) => {
            const isMine =
              message.expediteur_id === user?.id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm sm:max-w-[65%] ${
                    isMine
                      ? "rounded-br-md bg-orange-500 text-black"
                      : "rounded-bl-md bg-zinc-900 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {message.contenu}
                  </p>

                  <p
                    className={`mt-2 text-[10px] ${
                      isMine
                        ? "text-black/60"
                        : "text-zinc-500"
                    }`}
                  >
                    {new Date(
                      message.created_at
                    ).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="border-t border-zinc-800 bg-zinc-950 p-4">
        <div className="mx-auto flex max-w-4xl gap-3">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Écrivez votre message..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm outline-none transition focus:border-orange-500"
          />

          <button
            onClick={sendMessage}
            disabled={!content.trim() || sending}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Envoyer"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}