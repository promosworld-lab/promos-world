import { supabase } from "@/lib/supabase";

export const messagesService = {
  async getConversation(
    userId: string,
    otherUserId: string
  ) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(expediteur_id.eq.${userId},destinataire_id.eq.${otherUserId}),and(expediteur_id.eq.${otherUserId},destinataire_id.eq.${userId})`
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) throw error;

    return data;
  },

  async send(payload: {
    expediteur_id: string;
    destinataire_id: string;
    contenu: string;
    promotion_id?: string | null;
  }) {
    const { data, error } = await supabase
      .from("messages")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async markAsRead(
    expediteurId: string,
    destinataireId: string
  ) {
    const { error } = await supabase
      .from("messages")
      .update({ lu: true })
      .eq("expediteur_id", expediteurId)
      .eq("destinataire_id", destinataireId)
      .eq("lu", false);

    if (error) throw error;
  },

  subscribeToConversation(
    userId: string,
    otherUserId: string,
    callback: (message: any) => void
  ) {
    const channel = supabase
      .channel(`conversation-${userId}-${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as any;

          const isConversationMessage =
            (message.expediteur_id === userId &&
              message.destinataire_id === otherUserId) ||
            (message.expediteur_id === otherUserId &&
              message.destinataire_id === userId);

          if (isConversationMessage) {
            callback(message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};