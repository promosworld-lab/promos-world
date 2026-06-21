'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MesMessages() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/auth')
      return
    }

    setUser(data.user)
    await fetchConversations(data.user.id)
  }

  const fetchConversations = async (userId) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('messages')
      .select('*, expediteur:profiles!messages_expediteur_id_fkey(id, nom, role), destinataire:profiles!messages_destinataire_id_fkey(id, nom, role), promotions(id, titre, photo_url, media_type)')
      .or(`expediteur_id.eq.${userId},destinataire_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const map = {}

      data.forEach(msg => {
        const autre = msg.expediteur_id === userId ? msg.destinataire : msg.expediteur
        const key = `${autre?.id}-${msg.promotion_id || 'general'}`

        if (!map[key]) {
          map[key] = {
            interlocuteurId: autre?.id,
            interlocuteurNom: autre?.nom || 'Utilisateur',
            interlocuteurRole: autre?.role || 'client',
            dernierMessage: msg.contenu,
            date: msg.created_at,
            promoTitre: msg.promotions?.titre,
            promoId: msg.promotion_id,
            lu: msg.lu,
            moiDernierExpediteur: msg.expediteur_id === userId,
          }
        }
      })

      setConversations(Object.values(map))
    }

    setLoading(false)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'À l’instant'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`

    return date.toLocaleDateString('fr-FR')
  }

  const getAvatar = (role) => {
    if (role === 'vendeur') return '🏪'
    if (role === 'admin') return '⚙️'
    return '👤'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{
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
      }}>
        <button
          onClick={() => router.push('/')}
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

        <div style={{ fontSize: '18px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
          💬 Mes messages
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Conversations avec les clients et les vendeurs.
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            Chargement...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '60px 20px',
            background: '#1A1A1A',
            borderRadius: '16px',
            border: '1px solid #2A2A2A',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
              Aucune conversation
            </div>
            <div style={{ fontSize: '13px' }}>
              Contacte un vendeur depuis une promo pour démarrer.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {conversations.map(conv => (
              <div
                key={`${conv.interlocuteurId}-${conv.promoId || 'general'}`}
                onClick={() => router.push(`/chat/${conv.interlocuteurId}${conv.promoId ? `?promo=${conv.promoId}` : ''}`)}
                style={{
                  background: '#1A1A1A',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid #2A2A2A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#222'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A1A1A'}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  background: '#252525',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                  border: '1px solid #333',
                }}>
                  {getAvatar(conv.interlocuteurRole)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>
                    {conv.interlocuteurNom}
                  </div>

                  {conv.promoTitre && (
                    <div style={{ fontSize: '11px', color: '#FF5C00', marginBottom: '3px' }}>
                      🏷️ {conv.promoTitre}
                    </div>
                  )}

                  <div style={{
                    fontSize: '12px',
                    color: '#888',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {conv.moiDernierExpediteur ? 'Moi : ' : ''}
                    {conv.dernierMessage}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#555', flexShrink: 0 }}>
                  {formatDate(conv.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}