'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Messages() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    const currentUser = authData.user
    setUser(currentUser)

    await loadMessages(currentUser.id)

    setLoading(false)
  }

  const loadMessages = async (userId) => {
    const { data, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        expediteur:profiles!messages_expediteur_id_fkey(
          id,
          nom,
          avatar_url
        ),
        destinataire:profiles!messages_destinataire_id_fkey(
          id,
          nom,
          avatar_url
        ),
        promotions(
          id,
          titre
        )
      `)
      .or(
        `expediteur_id.eq.${userId},destinataire_id.eq.${userId}`
      )
      .order('created_at', { ascending: false })

    if (messagesError) {
      console.error('Erreur messages:', messagesError)
      setError(
        'Impossible de récupérer les messages. Vérifie la structure de la table messages.'
      )
      setMessages([])
      return
    }

    setMessages(data || [])
  }

  const getOtherUser = (message) => {
    if (!user) return null

    if (message.expediteur_id === user.id) {
      return message.destinataire
    }

    return message.expediteur
  }

  const getOtherUserId = (message) => {
    if (!user) return null

    if (message.expediteur_id === user.id) {
      return message.destinataire_id
    }

    return message.expediteur_id
  }

  const getConversationKey = (message) => {
    const otherId = getOtherUserId(message)

    if (!otherId) {
      return null
    }

    return otherId
  }

  const getLastMessagePerConversation = () => {
    const conversations = new Map()

    for (const message of messages) {
      const key = getConversationKey(message)

      if (!key) continue

      if (!conversations.has(key)) {
        conversations.set(key, message)
      }
    }

    return Array.from(conversations.values())
  }

  const conversations = getLastMessagePerConversation()

  const formatDate = (date) => {
    if (!date) return ''

    const messageDate = new Date(date)
    const now = new Date()

    const sameDay =
      messageDate.toDateString() === now.toDateString()

    if (sameDay) {
      return messageDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return messageDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const getMessagePreview = (message) => {
    if (message.contenu) {
      return message.contenu
    }

    if (message.message) {
      return message.message
    }

    return 'Message'
  }

  const openConversation = (message) => {
    const otherUserId = getOtherUserId(message)

    if (!otherUserId) return

    router.push(`/chat/${otherUserId}`)
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          color: '#888',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        Chargement...
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#0A0A0A',
          borderBottom: '1px solid #1E1E1E',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: '36px',
            height: '36px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          ←
        </button>

        <div
          style={{
            fontSize: '18px',
            fontWeight: '800',
            color: '#FF5C00',
          }}
        >
          Promo's
          <span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: '80px 20px 40px',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '6px',
          }}
        >
          💬 Messages
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Retrouvez vos conversations avec les vendeurs et les clients.
        </div>

        {/* ERREUR */}
        {error && (
          <div
            style={{
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF6B6B',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            {error}
          </div>
        )}

        {/* AUCUNE CONVERSATION */}
        {conversations.length === 0 ? (
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '42px',
                marginBottom: '12px',
              }}
            >
              💬
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '700',
                marginBottom: '6px',
              }}
            >
              Aucune conversation
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#888',
                lineHeight: '1.5',
              }}
            >
              Vos conversations apparaîtront ici lorsque vous échangerez
              avec un vendeur ou un client.
            </div>
          </div>
        ) : (
          /* LISTE DES CONVERSATIONS */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {conversations.map((message) => {
              const otherUser = getOtherUser(message)
              const otherUserId = getOtherUserId(message)

              if (!otherUserId) return null

              return (
                <button
                  key={message.id}
                  onClick={() => openConversation(message)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '16px',
                    padding: '15px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* AVATAR */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      minWidth: '46px',
                      borderRadius: '50%',
                      background: '#252525',
                      border: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontSize: '20px',
                    }}
                  >
                    {otherUser?.avatar_url ? (
                      <img
                        src={otherUser.avatar_url}
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      '👤'
                    )}
                  </div>

                  {/* INFOS */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        marginBottom: '5px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {otherUser?.nom || 'Utilisateur'}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: '#666',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatDate(message.created_at)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#888',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getMessagePreview(message)}
                    </div>

                    {message.promotions?.titre && (
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#FF5C00',
                          marginTop: '5px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        🏷️ {message.promotions.titre}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      color: '#666',
                      fontSize: '18px',
                    }}
                  >
                    ›
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* RETOUR CHAT */}
        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '13px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            color: '#AAA',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  )
}