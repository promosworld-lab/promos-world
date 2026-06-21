'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

function ChatContent() {
  const router = useRouter()
  const { vendeurId } = useParams()
  const searchParams = useSearchParams()
  const promoId = searchParams.get('promo')
  const messagesEndRef = useRef(null)

  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [interlocuteur, setInterlocuteur] = useState(null)
  const [promo, setPromo] = useState(null)
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let channel = null

    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/auth')
        return
      }

      setUser(data.user)
      await fetchInterlocuteur()
      if (promoId) await fetchPromo()
      await fetchMessages(data.user.id)

      channel = subscribeToMessages(data.user.id)
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [vendeurId, promoId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchInterlocuteur = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, nom, role')
      .eq('id', vendeurId)
      .single()

    setInterlocuteur(data)
  }

  const fetchPromo = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('id, titre, prix_promo')
      .eq('id', promoId)
      .single()

    setPromo(data)
  }

  const fetchMessages = async (userId) => {
    setLoading(true)

    let query = supabase
      .from('messages')
      .select('*')
      .or(`and(expediteur_id.eq.${userId},destinataire_id.eq.${vendeurId}),and(expediteur_id.eq.${vendeurId},destinataire_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    if (promoId) {
      query = query.eq('promotion_id', promoId)
    }

    const { data, error } = await query

    if (!error) {
      setMessages(data || [])
    }

    setLoading(false)

    await supabase
      .from('messages')
      .update({ lu: true })
      .eq('destinataire_id', userId)
      .eq('expediteur_id', vendeurId)
  }

  const subscribeToMessages = (userId) => {
    return supabase
      .channel(`chat-${userId}-${vendeurId}-${promoId || 'general'}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, payload => {
        const msg = payload.new

        const sameUsers =
          (msg.expediteur_id === userId && msg.destinataire_id === vendeurId) ||
          (msg.expediteur_id === vendeurId && msg.destinataire_id === userId)

        const samePromo = promoId ? msg.promotion_id === promoId : true

        if (sameUsers && samePromo) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === msg.id)
            if (exists) return prev
            return [...prev, msg]
          })
        }
      })
      .subscribe()
  }

  const handleEnvoyer = async () => {
    if (!contenu.trim() || !user || sending) return

    setSending(true)

    const texte = contenu.trim()
    setContenu('')

    const { error } = await supabase.from('messages').insert({
      expediteur_id: user.id,
      destinataire_id: vendeurId,
      promotion_id: promoId || null,
      contenu: texte,
      lu: false,
    })

    if (error) {
      setContenu(texte)
      console.error('Erreur envoi message:', error)
    }

    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnvoyer()
    }
  }

  const formatHeure = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const avatar = interlocuteur?.role === 'vendeur' ? '🏪' : interlocuteur?.role === 'admin' ? '⚙️' : '👤'

  return (
    <div style={{
      height: '100vh',
      background: '#0A0A0A',
      color: 'white',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #1E1E1E',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
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

        <div style={{
          width: '38px',
          height: '38px',
          background: '#1A1A1A',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          border: '1px solid #2A2A2A',
        }}>
          {avatar}
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {interlocuteur?.nom || 'Utilisateur'}
          </div>
          <div style={{ fontSize: '11px', color: '#00C48C' }}>
            ● Conversation sécurisée
          </div>
        </div>
      </div>

      {promo && (
        <div
          onClick={() => router.push(`/promo/${promo.id}`)}
          style={{
            margin: '10px 16px 0',
            background: 'rgba(255,92,0,0.08)',
            border: '1px solid rgba(255,92,0,0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '14px' }}>🏷️</span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Re : <strong style={{ color: 'white' }}>{promo.titre}</strong>
            {' · '}{Number(promo.prix_promo || 0).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      )}

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        scrollbarWidth: 'none',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              Début de la conversation
            </div>
            <div style={{ fontSize: '12px' }}>
              Envoie un premier message.
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const estMoi = msg.expediteur_id === user?.id

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: estMoi ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderBottomRightRadius: estMoi ? '4px' : '14px',
                  borderBottomLeftRadius: estMoi ? '14px' : '4px',
                  background: estMoi ? '#FF5C00' : '#1A1A1A',
                  border: estMoi ? 'none' : '1px solid #2A2A2A',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                }}>
                  {msg.contenu}
                </div>

                <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', padding: '0 4px' }}>
                  {formatHeure(msg.created_at)}
                </div>
              </div>
            )
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #1E1E1E',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
        flexShrink: 0,
        background: '#0A0A0A',
      }}>
        <textarea
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message..."
          rows={1}
          style={{
            flex: 1,
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            padding: '10px 16px',
            color: 'white',
            fontSize: '13px',
            outline: 'none',
            resize: 'none',
            fontFamily: 'sans-serif',
            lineHeight: '1.5',
            maxHeight: '100px',
            scrollbarWidth: 'none',
          }}
        />

        <button
          onClick={handleEnvoyer}
          disabled={!contenu.trim() || sending}
          style={{
            width: '40px',
            height: '40px',
            background: contenu.trim() && !sending ? '#FF5C00' : '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '50%',
            color: 'white',
            fontSize: '16px',
            cursor: contenu.trim() && !sending ? 'pointer' : 'not-allowed',
            flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

export default function Chat() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontFamily: 'sans-serif',
      }}>
        Chargement...
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}