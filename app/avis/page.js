'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function AvisContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reservationId = searchParams.get('reservation')
  const vendeurId = searchParams.get('vendeur')

  const [user, setUser] = useState(null)
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [hover, setHover] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [dejaNote, setDejaNote] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { router.push('/auth'); return }
    setUser(data.user)
    checkDejaNote(data.user.id)
  }

  const checkDejaNote = async (userId) => {
    const { data } = await supabase
      .from('avis')
      .select('id')
      .eq('client_id', userId)
      .eq('reservation_id', reservationId)
      .single()

    if (data) setDejaNote(true)
  }

  const handleSubmit = async () => {
    if (note === 0) {
      setMessage('Choisis une note entre 1 et 5 étoiles.')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('avis').insert({
      client_id: user.id,
      vendeur_id: vendeurId,
      reservation_id: reservationId,
      note,
      commentaire: commentaire.trim() || null,
    })

    if (error) {
      setMessage('Erreur lors de la soumission.')
      setLoading(false)
      return
    }

    setMessage('success')
    setLoading(false)
  }

  if (message === 'success' || dejaNote) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'sans-serif',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>
            {dejaNote && message !== 'success' ? '✅' : '⭐'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
            {dejaNote && message !== 'success' ? 'Avis déjà soumis' : 'Merci pour ton avis !'}
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
            {dejaNote && message !== 'success'
              ? 'Tu as déjà noté ce vendeur pour cette transaction.'
              : "Ton avis aide la communauté Promo's World."}
          </div>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 28px', background: '#FF5C00',
              border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: '700',
              fontSize: '14px', cursor: 'pointer'
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      color: 'white', fontFamily: 'sans-serif',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px',
        background: '#1A1A1A', borderRadius: '20px',
        padding: '32px', border: '1px solid #2A2A2A'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF5C00' }}>
            Promo's<span style={{ color: 'white' }}>World</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>⭐</div>
          <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>
            Note ce vendeur
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Comment s'est passée ta transaction ?
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              onClick={() => setNote(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              style={{
                fontSize: '36px', cursor: 'pointer',
                transition: 'transform 0.1s',
                transform: (hover || note) >= s ? 'scale(1.2)' : 'scale(1)',
                filter: (hover || note) >= s ? 'none' : 'grayscale(100%)'
              }}
            >
              ⭐
            </div>
          ))}
        </div>

        {(hover || note) > 0 && (
          <div style={{
            textAlign: 'center', marginBottom: '20px',
            fontSize: '13px', fontWeight: '600', color: '#FF5C00'
          }}>
            {['', 'Très mauvais 😞', 'Mauvais 😕', 'Correct 😐', 'Bien 😊', 'Excellent ! 🔥'][hover || note]}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px' }}>
            Commentaire (optionnel)
          </label>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Décris ton expérience avec ce vendeur..."
            rows={4}
            style={{
              width: '100%', padding: '12px 14px',
              background: '#111', border: '1px solid #333',
              borderRadius: '10px', color: 'white',
              fontSize: '13px', outline: 'none',
              resize: 'none', fontFamily: 'sans-serif',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {message && message !== 'success' && (
          <div style={{
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(255,60,60,0.1)',
            border: '1px solid #FF3C3C',
            color: '#FF3C3C', fontSize: '12px',
            marginBottom: '16px'
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#333' : '#FF5C00',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: '700',
            fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {loading ? 'Envoi...' : 'Soumettre mon avis'}
        </button>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%', padding: '12px',
            background: 'transparent', border: '1px solid #2A2A2A',
            borderRadius: '12px', color: '#888',
            fontSize: '13px', cursor: 'pointer'
          }}
        >
          Passer
        </button>
      </div>
    </div>
  )
}

export default function Avis() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#0A0A0A',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#888',
        fontFamily: 'sans-serif'
      }}>
        Chargement...
      </div>
    }>
      <AvisContent />
    </Suspense>
  )
}