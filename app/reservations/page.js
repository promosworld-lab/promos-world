'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MesReservations() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('acompte_paye')
  const [message, setMessage] = useState('')

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
    await fetchReservations(data.user.id)
  }

  const fetchReservations = async (userId) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('reservations')
      .select('*, promotions(titre, prix_promo, prix_original, photo_url, media_type, vendeur_id, profiles(nom, adresse))')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    if (!error) {
      setReservations(data || [])
    }

    setLoading(false)
  }

  const handleConfirmerReception = async (reservation) => {
    if (!user) return

    setMessage('')

    const { error: reservationError } = await supabase
      .from('reservations')
      .update({
        client_confirme: true,
        statut: reservation.vendeur_confirme ? 'terminee' : 'acompte_paye',
      })
      .eq('id', reservation.id)

    if (reservationError) {
      setMessage('Erreur lors de la confirmation.')
      return
    }

    if (reservation.vendeur_confirme) {
      await supabase
        .from('transactions')
        .update({ statut: 'libere' })
        .eq('reservation_id', reservation.id)
    }

    setMessage('✅ Confirmation envoyée.')
    await fetchReservations(user.id)
    setTimeout(() => setMessage(''), 4000)
  }

  const reservationsFiltrees = reservations.filter(r => r.statut === onglet)

  const onglets = [
    { key: 'acompte_paye', label: '⏳ En cours' },
    { key: 'terminee', label: '✅ Terminées' },
    { key: 'annulee', label: '❌ Annulées' },
    { key: 'expiree', label: '⌛ Expirées' },
  ]

  const statutColor = (statut) => {
    if (statut === 'terminee') return { bg: 'rgba(0,196,140,0.15)', color: '#00C48C' }
    if (statut === 'acompte_paye') return { bg: 'rgba(255,184,0,0.15)', color: '#FFB800' }
    if (statut === 'annulee') return { bg: 'rgba(255,60,60,0.1)', color: '#FF3C3C' }
    return { bg: 'rgba(255,255,255,0.05)', color: '#888' }
  }

  const statutLabel = (statut) => {
    if (statut === 'terminee') return 'Terminée'
    if (statut === 'acompte_paye') return 'En cours'
    if (statut === 'annulee') return 'Annulée'
    if (statut === 'expiree') return 'Expirée'
    return statut
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

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
          📋 Mes réservations
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Suivi de tes réservations et confirmations.
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: message.includes('Erreur') ? 'rgba(255,60,60,0.1)' : 'rgba(0,196,140,0.1)',
            border: `1px solid ${message.includes('Erreur') ? '#FF3C3C' : '#00C48C'}`,
            color: message.includes('Erreur') ? '#FF3C3C' : '#00C48C',
            fontSize: '13px',
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {onglets.map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: onglet === o.key ? '1px solid #FF5C00' : '1px solid #2A2A2A',
                background: onglet === o.key ? 'rgba(255,92,0,0.1)' : '#1A1A1A',
                color: onglet === o.key ? '#FF5C00' : '#888',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {o.label}
              <span style={{
                marginLeft: '6px',
                background: '#2A2A2A',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#888',
              }}>
                {reservations.filter(r => r.statut === o.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            Chargement...
          </div>
        ) : reservationsFiltrees.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '60px 20px',
            background: '#1A1A1A',
            borderRadius: '16px',
            border: '1px solid #2A2A2A',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Aucune réservation ici</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reservationsFiltrees.map(r => {
              const promo = r.promotions
              const isVideo = promo?.media_type === 'video' || promo?.photo_url?.includes('.mp4')

              return (
                <div key={r.id} style={{
                  background: '#1A1A1A',
                  borderRadius: '16px',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderBottom: '1px solid #222',
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      background: '#252525',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {promo?.photo_url ? (
                        isVideo ? (
                          <video src={promo.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <span style={{ fontSize: '22px' }}>🏷️</span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>
                        {promo?.titre || 'Promotion supprimée'}
                      </div>

                      <div style={{ fontSize: '12px', color: '#888' }}>
                        🏪 {promo?.profiles?.nom || 'Vendeur'}
                      </div>

                      {promo?.profiles?.adresse && (
                        <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                          📍 {promo.profiles.adresse}
                        </div>
                      )}
                    </div>

                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: statutColor(r.statut).bg,
                      color: statutColor(r.statut).color,
                      flexShrink: 0,
                    }}>
                      {statutLabel(r.statut)}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #222' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ color: '#888' }}>Acompte payé</span>
                      <span style={{ color: '#00C48C', fontWeight: '700' }}>
                        ✓ {formatMoney(r.montant_acompte)} FCFA
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ color: '#888' }}>Reste à payer</span>
                      <span style={{ fontWeight: '700' }}>
                        {formatMoney(r.montant_restant)} FCFA
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#888' }}>Valable jusqu’au</span>
                      <span style={{ color: '#FF5C00', fontWeight: '600' }}>
                        {r.date_expiration ? new Date(r.date_expiration).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {r.statut === 'acompte_paye' && !r.client_confirme && (
                      <button
                        onClick={() => handleConfirmerReception(r)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: 'rgba(0,196,140,0.15)',
                          border: '1px solid #00C48C',
                          borderRadius: '10px',
                          color: '#00C48C',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        ✅ J’ai payé le reste et reçu l’article
                      </button>
                    )}

                    {r.statut === 'acompte_paye' && r.client_confirme && (
                      <div style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255,184,0,0.1)',
                        border: '1px solid #FFB800',
                        borderRadius: '10px',
                        color: '#FFB800',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                      }}>
                        ⏳ En attente du vendeur
                      </div>
                    )}

                    {r.statut === 'terminee' && (
                      <button
                        onClick={() => router.push(`/avis?reservation=${r.id}&vendeur=${promo?.vendeur_id}`)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#FF5C00',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ⭐ Laisser un avis
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/chat/${promo?.vendeur_id}?promo=${r.promotion_id}`)}
                      style={{
                        padding: '10px 16px',
                        background: '#252525',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      💬
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}