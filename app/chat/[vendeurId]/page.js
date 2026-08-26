'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function ChatVendeur() {
  const router = useRouter()
  const params = useParams()
  const vendeurId = params?.vendeurId

  const messagesEndRef = useRef(null)

  const [user, setUser] = useState(null)
  const [vendeur, setVendeur] = useState(null)
  const [messages, setMessages] = useState([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!vendeurId) return

    initPage()
  }, [vendeurId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 50)
  }

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    if (authData.user.id === vendeurId) {
      setError('Tu ne peux pas discuter avec ton propre compte.')
      setLoading(false)
      return
    }

    await loadVendeur(vendeurId)
    await loadMessages(authData.user.id, vendeurId)

    setLoading(false)
  }

  const loadVendeur = async (id) => {
    const { data, error: vendeurError } = await supabase
      .from('profiles')
      .select('id, nom, role, adresse')
      .eq('id', id)
      .single()

    if (vendeurError) {
      console.error('Erreur vendeur :', vendeurError)
      setError('Impossible de trouver ce vendeur.')
      return
    }

    setVendeur(data)
  }

  const loadMessages = async (userId, sellerId) => {
    const { data, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(expediteur_id.eq.${userId},destinataire_id.eq.${sellerId}),and(expediteur_id.eq.${sellerId},destinataire_id.eq.${userId})`
      )
      .order('created_at', {
        ascending: true,
      })

    if (messagesError) {
      console.error('Erreur messages :', messagesError)
      setError(
        'Impossible de récupérer les messages.'
      )
      return
    }

    setMessages(data || [])
  }

  const handleSend = async () => {
    const contenu = message.trim()

    if (!contenu || !user || !vendeurId || sending) {
      return
    }

    setSending(true)
    setError('')

    const { data, error: sendError } = await supabase
      .from('messages')
      .insert({
        expediteur_id: user.id,
        destinataire_id: vendeurId,
        contenu,
      })
      .select()
      .single()

    if (sendError) {
      console.error('Erreur envoi message :', sendError)

      setError(
        `Impossible d'envoyer le message : ${sendError.message}`
      )

      setSending(false)
      return
    }

    if (data) {
      setMessages(prev => [...prev, data])
    }

    setMessage('')
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date) => {
    if (!date) return ''

    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isMine = (msg) => {
    return msg.expediteur_id === user?.id
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
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* HEADER */}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: '#0A0A0A',
          borderBottom: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
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
            flexShrink: 0,
          }}
        >
          ←
        </button>

        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#252525',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}
        >
          👤
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
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
            {vendeur?.nom || 'Vendeur'}
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#888',
              marginTop: '2px',
            }}
          >
            {vendeur?.adresse || 'Vendeur Promo’s World'}
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      <div
        style={{
          flex: 1,
          paddingTop: '84px',
          paddingBottom: '90px',
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {error && (
          <div
            style={{
              margin: '0 16px 14px',
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF8A8A',
              fontSize: '12px',
            }}
          >
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div
            style={{
              minHeight: '55vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div>
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
                  fontWeight: '800',
                  marginBottom: '6px',
                }}
              >
                Aucun message
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  lineHeight: 1.5,
                }}
              >
                Commence la conversation avec{' '}
                {vendeur?.nom || 'ce vendeur'}.
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px 16px',
            }}
          >
            {messages.map(msg => {
              const mine = isMine(msg)

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: mine
                      ? 'flex-end'
                      : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '78%',
                      background: mine
                        ? '#FF5C00'
                        : '#1A1A1A',
                      border: mine
                        ? 'none'
                        : '1px solid #2A2A2A',
                      borderRadius: mine
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {msg.contenu}
                    </div>

                    <div
                      style={{
                        fontSize: '9px',
                        marginTop: '5px',
                        textAlign: 'right',
                        opacity: mine ? 0.75 : 0.5,
                      }}
                    >
                      {formatTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              )
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ZONE D'ENVOI */}

      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0A0A0A',
          borderTop: '1px solid #1E1E1E',
          padding: '10px 16px',
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '760px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écris ton message..."
            rows={1}
            disabled={!vendeur || sending}
            style={{
              flex: 1,
              minHeight: '42px',
              maxHeight: '110px',
              resize: 'none',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              outline: 'none',
              padding: '11px 13px',
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />

          <button
            onClick={handleSend}
            disabled={
              sending ||
              !message.trim() ||
              !vendeur
            }
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '13px',
              border: 'none',
              background:
                sending || !message.trim() || !vendeur
                  ? '#333'
                  : '#FF5C00',
              color: 'white',
              fontSize: '18px',
              cursor:
                sending ||
                !message.trim() ||
                !vendeur
                  ? 'not-allowed'
                  : 'pointer',
              flexShrink: 0,
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}