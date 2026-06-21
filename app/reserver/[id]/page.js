'use client'

import { useState, useEffect, Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Reserver() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [methodePaiement, setMethodePaiement] = useState('orange')
  const [etape, setEtape] = useState(1)
  const [reservation, setReservation] = useState(null)
  const [message, setMessage] = useState('')

  const methodes = [
    { id: 'orange', label: 'Orange Money', icon: '📱' },
    { id: 'mtn', label: 'MTN Mobile Money', icon: '📲' },
    { id: 'wave', label: 'Wave', icon: '🌊' },
    { id: 'moov', label: 'Moov Money', icon: '💜' },
    { id: 'carte', label: 'Carte bancaire', icon: '💳' },
  ]

  useEffect(() => {
    initPage()
  }, [id])

  const initPage = async () => {
    setLoading(true)

    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    const { data, error } = await supabase
      .from('promotions')
      .select('*, profiles(nom, adresse)')
      .eq('id', id)
      .single()

    if (!error) {
      setPromo(data)
    }

    setLoading(false)
  }

  const handleReserver = async () => {
    if (!user || !promo || processing) return

    setProcessing(true)
    setMessage('')

    if (promo.statut !== 'actif') {
      setMessage('Cette promo n’est pas active.')
      setProcessing(false)
      return
    }

    if (Number(promo.stock) <= 0) {
      setMessage('Stock épuisé.')
      setProcessing(false)
      return
    }

    const acompte = Math.round(Number(promo.prix_promo) * 0.2)
    const restant = Number(promo.prix_promo) - acompte
    const commission = Math.round(Number(promo.prix_promo) * 0.02)

    const dateExpiration = new Date()
    dateExpiration.setMonth(dateExpiration.getMonth() + 3)

    const { data: reservationData, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        client_id: user.id,
        promotion_id: promo.id,
        montant_acompte: acompte,
        montant_restant: restant,
        statut: 'acompte_paye',
        methode_paiement: methodePaiement,
        client_confirme: false,
        vendeur_confirme: false,
        date_expiration: dateExpiration.toISOString(),
      })
      .select()
      .single()

    if (reservationError) {
      setMessage(`Erreur réservation : ${reservationError.message}`)
      setProcessing(false)
      return
    }

    await supabase.from('transactions').insert({
      type: 'reservation',
      client_id: user.id,
      vendeur_id: promo.vendeur_id,
      promotion_id: promo.id,
      reservation_id: reservationData.id,
      montant_total: Number(promo.prix_promo),
      montant_paye: acompte,
      commission_plateforme: commission,
      methode_paiement: methodePaiement,
      statut: 'bloque',
    })

    await supabase
      .from('promotions')
      .update({ stock: Number(promo.stock) - 1 })
      .eq('id', promo.id)

    setReservation(reservationData)
    setEtape(3)
    setProcessing(false)
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Chargement...
      </div>
    )
  }

  if (!promo) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Promotion introuvable.
      </div>
    )
  }

  const acompte = Math.round(Number(promo.prix_promo) * 0.2)
  const restant = Number(promo.prix_promo) - acompte

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
          onClick={() => (etape === 1 ? router.back() : setEtape(etape - 1))}
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

        <div style={{ fontSize: '16px', fontWeight: '700' }}>
          {etape === 3 ? 'Réservation confirmée' : 'Réservation'}
        </div>
      </div>

      <div style={{ paddingTop: '70px', maxWidth: '500px', margin: '0 auto', padding: '80px 20px 40px' }}>
        {etape < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1, 2, 3].map((s, i) => (
              <Fragment key={s}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  background: etape >= s ? '#FF5C00' : '#1A1A1A',
                  border: etape >= s ? 'none' : '1px solid #333',
                  color: etape >= s ? 'white' : '#888',
                  flexShrink: 0,
                }}>
                  {s}
                </div>

                {i < 2 && (
                  <div style={{ flex: 1, height: '1px', background: etape > s ? '#FF5C00' : '#333' }} />
                )}
              </Fragment>
            ))}
          </div>
        )}

        {etape === 1 && (
          <>
            <div style={{
              background: '#1A1A1A',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #2A2A2A',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#252525',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                overflow: 'hidden',
              }}>
                {promo.photo_url ? (
                  promo.media_type === 'video' || promo.photo_url.includes('.mp4') ? (
                    <video src={promo.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : '🏷️'}
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>
                  {promo.titre}
                </div>

                <div style={{ fontSize: '12px', color: '#888' }}>
                  {promo.profiles?.nom} · {promo.profiles?.adresse || 'Adresse non précisée'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
              Mode de paiement
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {methodes.map(m => (
                <div
                  key={m.id}
                  onClick={() => setMethodePaiement(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: methodePaiement === m.id ? '1px solid #FF5C00' : '1px solid #2A2A2A',
                    background: methodePaiement === m.id ? 'rgba(255,92,0,0.08)' : '#1A1A1A',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: '32px', height: '32px', background: '#252525', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                    {m.icon}
                  </div>

                  <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>
                    {m.label}
                  </div>

                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: methodePaiement === m.id ? '2px solid #FF5C00' : '2px solid #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#FF5C00',
                  }}>
                    {methodePaiement === m.id ? '●' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: '#1A1A1A',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #2A2A2A',
              marginBottom: '20px',
            }}>
              {[
                { label: 'Prix total', value: `${formatMoney(promo.prix_promo)} FCFA` },
                { label: 'Acompte à bloquer (20%)', value: `${formatMoney(acompte)} FCFA`, color: '#FF5C00' },
                { label: 'Reste à payer plus tard', value: `${formatMoney(restant)} FCFA` },
                { label: 'Validité', value: '3 mois' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: i < 3 ? '8px' : '0',
                  fontSize: '13px',
                }}>
                  <span style={{ color: '#888' }}>{item.label}</span>
                  <span style={{ fontWeight: '700', color: item.color || 'white' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setEtape(2)}
              style={{
                width: '100%',
                padding: '15px',
                background: '#FF5C00',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Continuer →
            </button>
          </>
        )}

        {etape === 2 && (
          <>
            <div style={{
              background: '#1A1A1A',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #2A2A2A',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
                Récapitulatif
              </div>

              {[
                { label: 'Article', value: promo.titre },
                { label: 'Vendeur', value: promo.profiles?.nom },
                { label: 'Mode de paiement', value: methodes.find(m => m.id === methodePaiement)?.label },
                { label: 'Acompte à payer', value: `${formatMoney(acompte)} FCFA` },
                { label: 'Réservation valable', value: '3 mois' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '13px',
                  gap: '12px',
                }}>
                  <span style={{ color: '#888' }}>{item.label}</span>
                  <span style={{ fontWeight: '600', maxWidth: '55%', textAlign: 'right' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(255,92,0,0.08)',
              borderRadius: '12px',
              padding: '12px 14px',
              border: '1px solid rgba(255,92,0,0.2)',
              fontSize: '12px',
              color: '#888',
              marginBottom: '20px',
              lineHeight: '1.6',
            }}>
              🔒 En V1, ce bouton simule le paiement. Quand CinetPay sera connecté, il lancera le vrai paiement Mobile Money ou carte.
            </div>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '16px',
                background: 'rgba(255,60,60,0.1)',
                border: '1px solid #FF3C3C',
                color: '#FF3C3C',
                fontSize: '13px',
              }}>
                {message}
              </div>
            )}

            <button
              onClick={handleReserver}
              disabled={processing}
              style={{
                width: '100%',
                padding: '15px',
                background: processing ? '#333' : '#FF5C00',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: processing ? 'not-allowed' : 'pointer',
                marginBottom: '10px',
              }}
            >
              {processing ? 'Traitement...' : `Confirmer et payer ${formatMoney(acompte)} FCFA`}
            </button>

            <button
              onClick={() => setEtape(1)}
              disabled={processing}
              style={{
                width: '100%',
                padding: '13px',
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: '14px',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Modifier
            </button>
          </>
        )}

        {etape === 3 && reservation && (
          <>
            <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>

              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
                Réservation confirmée !
              </div>

              <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
                Ton acompte de <strong style={{ color: '#FF5C00' }}>{formatMoney(acompte)} FCFA</strong> est sécurisé.
                <br />
                Tu as 3 mois pour finaliser l’achat.
              </div>
            </div>

            <div style={{
              background: '#1A1A1A',
              borderRadius: '16px',
              border: '1px solid #2A2A2A',
              overflow: 'hidden',
              marginBottom: '20px',
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid #222' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>ARTICLE</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{promo.titre}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{promo.profiles?.nom}</div>
              </div>

              <div style={{ padding: '16px' }}>
                {[
                  { label: 'Acompte bloqué', value: `✓ ${formatMoney(acompte)} FCFA`, color: '#00C48C' },
                  { label: 'Reste à payer', value: `${formatMoney(restant)} FCFA` },
                  { label: 'Valable jusqu’au', value: new Date(reservation.date_expiration).toLocaleDateString('fr-FR'), color: '#FF5C00' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: i < 2 ? '8px' : '0',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: '#888' }}>{item.label}</span>
                    <span style={{ fontWeight: '700', color: item.color || 'white' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/reservations')}
              style={{
                width: '100%',
                padding: '14px',
                background: '#FF5C00',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              Voir mes réservations
            </button>

            <button
              onClick={() => router.push(`/chat/${promo.vendeur_id}?promo=${id}`)}
              style={{
                width: '100%',
                padding: '13px',
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '14px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              💬 Contacter le vendeur
            </button>
          </>
        )}
      </div>
    </div>
  )
}