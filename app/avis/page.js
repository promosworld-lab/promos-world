'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Avis() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [avis, setAvis] = useState([])
  const [reservations, setReservations] = useState([])

  const [reservationId, setReservationId] = useState('')
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    await Promise.all([
      loadAvis(authData.user.id),
      loadReservations(authData.user.id),
    ])

    setLoading(false)
  }

  const loadAvis = async (userId) => {
    const { data, error } = await supabase
      .from('avis')
      .select(`
        *,
        client:profiles!avis_client_id_fkey(nom),
        vendeur:profiles!avis_vendeur_id_fkey(nom),
        promotions(titre)
      `)
      .or(`client_id.eq.${userId},vendeur_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement avis :', error)
      return
    }

    setAvis(data || [])
  }

  const loadReservations = async (userId) => {
    /*
      On récupère uniquement les réservations terminées
      pour lesquelles l'utilisateur peut laisser un avis.

      Le système accepte :
      - réservation livrée
      - réservation terminée
      - réservation avec réception confirmée
    */

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        client_id,
        vendeur_id,
        promotion_id,
        statut,
        created_at,
        promotions(titre),
        vendeur:profiles!reservations_vendeur_id_fkey(nom)
      `)
      .eq('client_id', userId)
      .in('statut', [
        'terminee',
        'termine',
        'livree',
        'livre',
        'reception_confirmee',
        'conforme'
      ])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement réservations pour avis :', error)
      setReservations([])
      return
    }

    /*
      On récupère également les réservations déjà évaluées
      afin de ne pas proposer deux fois la même réservation.
    */

    const { data: existingReviews, error: reviewsError } = await supabase
      .from('avis')
      .select('reservation_id')
      .eq('client_id', userId)

    if (reviewsError) {
      console.error('Erreur vérification avis :', reviewsError)
      setReservations(data || [])
      return
    }

    const reviewedIds = new Set(
      (existingReviews || [])
        .map(item => item.reservation_id)
        .filter(Boolean)
    )

    const availableReservations = (data || []).filter(
      reservation => !reviewedIds.has(reservation.id)
    )

    setReservations(availableReservations)
  }

  const handleSubmit = async () => {
    setMessage('')
    setError('')

    if (!reservationId) {
      setError('Choisis une réservation.')
      return
    }

    if (!note || note < 1 || note > 5) {
      setError('La note doit être comprise entre 1 et 5.')
      return
    }

    if (!commentaire.trim()) {
      setError('Écris un commentaire.')
      return
    }

    if (commentaire.trim().length < 5) {
      setError('Le commentaire doit contenir au moins 5 caractères.')
      return
    }

    const reservation = reservations.find(
      item => item.id === reservationId
    )

    if (!reservation) {
      setError('Réservation introuvable.')
      return
    }

    setSaving(true)

    const { error: insertError } = await supabase
      .from('avis')
      .insert({
        reservation_id: reservation.id,
        client_id: user.id,
        vendeur_id: reservation.vendeur_id,
        promotion_id: reservation.promotion_id,
        note: Number(note),
        commentaire: commentaire.trim(),
      })

    if (insertError) {
      console.error('Erreur création avis :', insertError)

      if (
        insertError.code === '23505' ||
        insertError.message?.toLowerCase().includes('duplicate')
      ) {
        setError('Tu as déjà laissé un avis pour cette réservation.')
      } else {
        setError(`Erreur lors de l'envoi de l'avis : ${insertError.message}`)
      }

      setSaving(false)
      return
    }

    setMessage('✅ Ton avis a été publié avec succès.')

    setReservationId('')
    setNote(5)
    setCommentaire('')

    await Promise.all([
      loadAvis(user.id),
      loadReservations(user.id),
    ])

    setSaving(false)
  }

  const formatDate = date => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const renderStars = value => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            style={{
              color: star <= value ? '#FFB800' : '#444',
              fontSize: '18px',
            }}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const getNoteLabel = value => {
    const labels = {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bien',
      5: 'Excellent',
    }

    return labels[value] || ''
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
          Promo's<span style={{ color: 'white' }}>World</span>
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
          ⭐ Avis
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
            lineHeight: '1.5',
          }}
        >
          Évalue les vendeurs et les achats que tu as réellement reçus.
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              background: 'rgba(0,196,140,0.1)',
              border: '1px solid #00C48C',
              color: '#00C48C',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {message}
          </div>
        )}

        {/* ERREUR */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF3C3C',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        {/* FORMULAIRE */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '18px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '16px',
              fontWeight: '800',
              marginBottom: '14px',
            }}
          >
            Laisser un avis
          </div>

          {reservations.length === 0 ? (
            <div
              style={{
                background: '#111',
                border: '1px solid #252525',
                borderRadius: '12px',
                padding: '18px',
                color: '#888',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            >
              Tu n'as actuellement aucune réservation terminée pouvant être
              évaluée.
            </div>
          ) : (
            <>
              {/* RESERVATION */}
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '7px',
                }}
              >
                Réservation
              </label>

              <select
                value={reservationId}
                onChange={e => setReservationId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: 'white',
                  marginBottom: '18px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                <option value="">
                  Choisir une réservation
                </option>

                {reservations.map(reservation => (
                  <option
                    key={reservation.id}
                    value={reservation.id}
                  >
                    {reservation.promotions?.titre || 'Article'} —{' '}
                    {reservation.vendeur?.nom || 'Vendeur'}
                  </option>
                ))}
              </select>

              {/* NOTE */}
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '7px',
                }}
              >
                Note
              </label>

              <div
                style={{
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '5px',
                    marginBottom: '8px',
                  }}
                >
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNote(star)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0',
                        cursor: 'pointer',
                        fontSize: '28px',
                        color: star <= note ? '#FFB800' : '#444',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  {getNoteLabel(note)}
                </div>
              </div>

              {/* COMMENTAIRE */}
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '7px',
                }}
              >
                Commentaire
              </label>

              <textarea
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                placeholder="Partage ton expérience avec ce vendeur..."
                rows={5}
                maxLength={1000}
                style={{
                  width: '100%',
                  padding: '13px',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  color: 'white',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  outline: 'none',
                  fontFamily: 'sans-serif',
                  marginBottom: '8px',
                }}
              />

              <div
                style={{
                  fontSize: '11px',
                  color: '#666',
                  textAlign: 'right',
                  marginBottom: '14px',
                }}
              >
                {commentaire.length}/1000
              </div>

              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: saving ? '#333' : '#FF5C00',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '800',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Publication...' : '⭐ Publier mon avis'}
              </button>
            </>
          )}
        </div>

        {/* LISTE DES AVIS */}
        <div
          style={{
            fontSize: '17px',
            fontWeight: '800',
            marginBottom: '12px',
          }}
        >
          Mes avis
        </div>

        {avis.length === 0 ? (
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '10px',
              }}
            >
              ⭐
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#aaa',
                marginBottom: '5px',
              }}
            >
              Aucun avis
            </div>

            <div
              style={{
                fontSize: '12px',
              }}
            >
              Tes avis apparaîtront ici après tes achats.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {avis.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        marginBottom: '4px',
                      }}
                    >
                      {item.promotions?.titre || 'Article'}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#888',
                      }}
                    >
                      Vendeur : {item.vendeur?.nom || '-'}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '11px',
                      color: '#777',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(item.created_at)}
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  {renderStars(Number(item.note || 0))}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#ccc',
                    lineHeight: '1.5',
                  }}
                >
                  {item.commentaire || 'Aucun commentaire.'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}