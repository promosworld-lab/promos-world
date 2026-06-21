'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function PromoDetail() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [user, setUser] = useState(null)
  const [avis, setAvis] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkUser()
    fetchPromo()
  }, [id])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchPromo = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('promotions')
      .select('*, profiles(nom, telephone, adresse)')
      .eq('id', id)
      .single()

    if (error || !data) {
      setPromo(null)
      setLoading(false)
      return
    }

    setPromo(data)
    await fetchAvis(data.vendeur_id)
    setLoading(false)
  }

  const fetchAvis = async (vendeurId) => {
    const { data } = await supabase
      .from('avis')
      .select('*, client:profiles!avis_client_id_fkey(nom)')
      .eq('vendeur_id', vendeurId)
      .order('created_at', { ascending: false })
      .limit(10)

    setAvis(data || [])
  }

  const moyenneNote = avis.length > 0
    ? (avis.reduce((sum, item) => sum + Number(item.note || 0), 0) / avis.length).toFixed(1)
    : null

  const mustLogin = () => {
    router.push('/auth')
  }

  const handleReserver = () => {
    if (!user) {
      mustLogin()
      return
    }

    if (promo.stock <= 0) {
      setMessage('Stock épuisé.')
      return
    }

    router.push(`/reserver/${id}`)
  }

  const handleAcheter = () => {
    if (!user) {
      mustLogin()
      return
    }

    if (promo.stock <= 0) {
      setMessage('Stock épuisé.')
      return
    }

    router.push(`/acheter/${id}`)
  }

  const handleChat = () => {
    if (!user) {
      mustLogin()
      return
    }

    router.push(`/chat/${promo.vendeur_id}?promo=${id}`)
  }

  const reduction = (original, promoPrice) => {
    if (!original || !promoPrice) return 0
    return Math.round((1 - Number(promoPrice) / Number(original)) * 100)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Chargement...
      </div>
    )
  }

  if (!promo) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
        Promo introuvable.
      </div>
    )
  }

  const acompte = Math.round(Number(promo.prix_promo) * 0.2)
  const restant = Number(promo.prix_promo) - acompte
  const isVideo = promo.media_type === 'video' || promo.photo_url?.includes('.mp4')
  const isInactive = promo.statut !== 'actif'
  const outOfStock = Number(promo.stock || 0) <= 0

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

        <div onClick={() => router.push('/')} style={{ fontSize: '20px', fontWeight: '800', color: '#FF5C00', cursor: 'pointer' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ paddingTop: '70px', maxWidth: '680px', margin: '0 auto', padding: '90px 20px 40px' }}>
        {message && (
          <div style={{
            padding: '12px 16px',
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

        <div style={{
          height: '280px',
          background: '#1A1A1A',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '24px',
          border: '1px solid #2A2A2A',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {promo.photo_url ? (
            isVideo ? (
              <video src={promo.photo_url} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          ) : (
            <span style={{ fontSize: '80px' }}>🏷️</span>
          )}

          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: '#FF5C00',
            color: 'white',
            fontSize: '14px',
            fontWeight: '800',
            padding: '6px 12px',
            borderRadius: '10px',
          }}>
            -{reduction(promo.prix_original, promo.prix_promo)}%
          </div>

          {outOfStock && (
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: '#FF3C3C',
              color: 'white',
              fontSize: '12px',
              fontWeight: '800',
              padding: '6px 12px',
              borderRadius: '10px',
            }}>
              Stock épuisé
            </div>
          )}
        </div>

        {isInactive && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '16px',
            background: 'rgba(255,184,0,0.12)',
            border: '1px solid rgba(255,184,0,0.3)',
            color: '#FFB800',
            fontSize: '13px',
          }}>
            Cette promo n’est pas encore active ou n’est plus disponible.
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px', lineHeight: '1.3' }}>
            {promo.titre}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C48C' }} />
              <span style={{ fontSize: '13px', color: '#888' }}>
                🏪 {promo.profiles?.nom || 'Vendeur'}
              </span>

              {promo.profiles?.adresse && (
                <span style={{ fontSize: '13px', color: '#555' }}>
                  · 📍 {promo.profiles.adresse}
                </span>
              )}
            </div>

            {moyenneNote && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#1A1A1A',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid #2A2A2A',
              }}>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{moyenneNote}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>({avis.length})</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '30px', fontWeight: '800', color: '#FF5C00' }}>
              {formatMoney(promo.prix_promo)} FCFA
            </span>

            <span style={{ fontSize: '16px', color: '#555', textDecoration: 'line-through' }}>
              {formatMoney(promo.prix_original)} FCFA
            </span>
          </div>
        </div>

        <div style={{
          background: '#1A1A1A',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #2A2A2A',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
            Détails
          </div>

          {[
            { label: 'Catégorie', value: promo.categorie || 'Non précisé' },
            { label: 'Stock disponible', value: `${promo.stock || 0} article(s)` },
            { label: 'Localisation', value: [promo.ville, promo.pays].filter(Boolean).join(', ') || 'Non précisé' },
            { label: 'Expire le', value: promo.date_expiration ? new Date(promo.date_expiration).toLocaleDateString('fr-FR') : 'Non précisé' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', gap: '14px' }}>
              <span style={{ color: '#888' }}>{item.label}</span>
              <span style={{ fontWeight: '500', textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {promo.description && (
          <div style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #2A2A2A',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              Description
            </div>

            <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {promo.description}
            </div>
          </div>
        )}

        <div style={{
          background: 'rgba(255,92,0,0.08)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid rgba(255,92,0,0.2)',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#FF5C00' }}>
            🔒 Réservation sécurisée
          </div>

          {[
            { label: 'Acompte maintenant', value: `${formatMoney(acompte)} FCFA`, color: '#FF5C00' },
            { label: 'Reste à payer plus tard', value: `${formatMoney(restant)} FCFA`, color: 'white' },
            { label: 'Validité', value: '3 mois', color: 'white' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', gap: '14px' }}>
              <span style={{ color: '#888' }}>{item.label}</span>
              <span style={{ fontWeight: '700', color: item.color, textAlign: 'right' }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div style={{
          background: '#1A1A1A',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #2A2A2A',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>
            💳 Achat direct
          </div>

          <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
            Tu peux aussi payer 100% maintenant. L’argent reste sécurisé par Promo’s World jusqu’à confirmation de réception.
          </div>
        </div>

        {avis.length > 0 && (
          <div style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #2A2A2A',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>
                Avis clients
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>⭐</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#FF5C00' }}>{moyenneNote}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>/ 5 · {avis.length}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {avis.map(item => (
                <div key={item.id} style={{
                  background: '#252525',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid #2A2A2A',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>
                      {item.client?.nom || 'Client'}
                    </div>

                    <div style={{ fontSize: '12px', color: '#FFB800' }}>
                      {'⭐'.repeat(Number(item.note || 0))}
                    </div>
                  </div>

                  {item.commentaire && (
                    <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
                      {item.commentaire}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: '#555', marginTop: '6px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleReserver}
          disabled={outOfStock || isInactive}
          style={{
            width: '100%',
            padding: '16px',
            background: outOfStock || isInactive ? '#333' : '#FF5C00',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '700',
            fontSize: '15px',
            cursor: outOfStock || isInactive ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
          }}
        >
          {outOfStock ? '😔 Stock épuisé' : `🔒 Réserver — ${formatMoney(acompte)} FCFA`}
        </button>

        <button
          onClick={handleAcheter}
          disabled={outOfStock || isInactive}
          style={{
            width: '100%',
            padding: '16px',
            background: outOfStock || isInactive ? '#333' : '#00C48C',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '700',
            fontSize: '15px',
            cursor: outOfStock || isInactive ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
          }}
        >
          💳 Acheter maintenant — {formatMoney(promo.prix_promo)} FCFA
        </button>

        <button
          onClick={handleChat}
          style={{
            width: '100%',
            padding: '14px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '500',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          💬 Contacter le vendeur
        </button>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#555', marginTop: '12px', lineHeight: '1.5' }}>
          Les fonds sont sécurisés par Promo’s World jusqu’à confirmation de la transaction.
        </div>
      </div>
    </div>
  )
}