'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams, useSearchParams } from 'next/navigation'

export default function Chat() {
  const router = useRouter()
  const { vendeurId } = useParams()
  const searchParams = useSearchParams()
  const promoId = searchParams.get('promo')
  const messagesEndRef = useRef(null)

  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [vendeur, setVendeur] = useState(null)
  const [promo, setPromo] = useState(null)
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { router.push('/auth'); return }
    setUser(data.user)
    fetchVendeur()
    if (promoId) fetchPromo()
    fetchMessages(data.user.id)
    subscribeToMessages(data.user.id)
  }

  const fetchVendeur = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', vendeurId)
      .single()
    setVendeur(data)
  }

  const fetchPromo = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('titre, prix_promo')
      .eq('id', promoId)
      .single()
    setPromo(data)
  }

  const fetchMessages = async (userId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`expediteur_id.eq.${userId},destinataire_id.eq.${userId}`)
      .order('created_at', { ascending: true })

    if (!error) setMessages(data || [])
    setLoading(false)
  }

  const subscribeToMessages = (userId) => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg = payload.new
        if (
          msg.expediteur_id === userId ||
          msg.destinataire_id === userId
        ) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  const handleEnvoyer = async () => {
    if (!contenu.trim() || !user) return

    const { error } = await supabase.from('messages').insert({
      expediteur_id: user.id,
      destinataire_id: vendeurId,
      promotion_id: promoId || null,
      contenu: contenu.trim(),
    })

    if (!error) setContenu('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnvoyer()
    }
  }

  const formatHeure = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div style={{
      height: '100vh', background: '#0A0A0A',
      color: 'white', fontFamily: 'sans-serif',
      display: 'flex', flexDirection: 'column'
    }}>

      {/* NAVBAR */}
      <div style={{
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '12px 20px', display: 'flex',
        alignItems: 'center', gap: '12px', flexShrink: 0
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: '36px', height: '36px',
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '10px', color: 'white',
            fontSize: '16px', cursor: 'pointer'
          }}
        >
          ←
        </button>

        <div style={{
          width: '38px', height: '38px', background: '#1A1A1A',
          borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', border: '1px solid #2A2A2A'
        }}>
          🏪
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {vendeur?.nom || 'Vendeur'}
          </div>
          <div style={{ fontSize: '11px', color: '#00C48C' }}>
            ● En ligne
          </div>
        </div>
      </div>

      {/* PROMO REFERENCE */}
      {promo && (
        <div style={{
          margin: '10px 16px 0',
          background: 'rgba(255,92,0,0.08)',
          border: '1px solid rgba(255,92,0,0.2)',
          borderRadius: '10px', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: '8px',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '14px' }}>🏷️</span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Re: <strong style={{ color: 'white' }}>{promo.titre}</strong>
            {' · '}{promo.prix_promo?.toLocaleString()} FCFA
          </span>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '16px', display: 'flex',
        flexDirection: 'column', gap: '12px',
        scrollbarWidth: 'none'
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
              Envoie un message au vendeur
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const estMoi = msg.expediteur_id === user?.id
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: estMoi ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderBottomRightRadius: estMoi ? '4px' : '14px',
                  borderBottomLeftRadius: estMoi ? '14px' : '4px',
                  background: estMoi ? '#FF5C00' : '#1A1A1A',
                  border: estMoi ? 'none' : '1px solid #2A2A2A',
                  fontSize: '13px', lineHeight: '1.5'
                }}>
                  {msg.contenu}
                </div>
                <div style={{
                  fontSize: '10px', color: '#555',
                  marginTop: '4px', padding: '0 4px'
                }}>
                  {formatHeure(msg.created_at)}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid #1E1E1E',
        display: 'flex', gap: '10px',
        alignItems: 'flex-end', flexShrink: 0,
        background: '#0A0A0A'
      }}>
        <textarea
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={1}
          style={{
            flex: 1, background: '#1A1A1A',
            border: '1px solid #2A2A2A', borderRadius: '20px',
            padding: '10px 16px', color: 'white',
            fontSize: '13px', outline: 'none',
            resize: 'none', fontFamily: 'sans-serif',
            lineHeight: '1.5', maxHeight: '100px',
            scrollbarWidth: 'none'
          }}
        />
        <button
          onClick={handleEnvoyer}
          style={{
            width: '40px', height: '40px',
            background: contenu.trim() ? '#FF5C00' : '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '50%', color: 'white',
            fontSize: '16px', cursor: 'pointer',
            flexShrink: 0, transition: 'background 0.2s'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  )
}