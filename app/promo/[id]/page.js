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

  useEffect(() => {
    fetchPromo()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchPromo = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promotions')
      .select(`*, profiles(nom, telephone, adresse)`)
      .eq('id', id)
      .single()

    if (!error) {
      setPromo(data)
      fetchAvis(data.vendeur_id)
    }
    setLoading(false)
  }

  const fetchAvis = async (vendeurId) => {
    const { data } = await supabase
      .from('avis')
      .select(`*, client:profiles!avis_client_id_fkey(nom)`)
      .eq('vendeur_id', vendeurId)
      .order('created_at', { ascending: false })
      .limit(5)

    setAvis(data || [])
  }

  const moyenneNote = avis.length > 0
    ? (avis.reduce((sum, a) => sum + a.note, 0) / avis.length).toFixed(1)
    : null

  const handleReserver = () => {
    if (!user) { router.push('/auth'); return }
    router.push(`/reserver/${id}`)
  }

  const reduction = (original, promo) => Math.round((1 - promo / original) * 100)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
      Chargement...
    </div>
  )

  if (!promo) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
      Promo introuvable.
    </div>
  )

  const acompte = Math.round(promo.prix_promo * 0.2)
  const restant = promo.prix_promo - acompte

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', gap: '12px', zIndex: 100
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
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ paddingTop: '70px', maxWidth: '600px', margin: '0 auto', padding: '80px 20px 40px' }}>

        {/* IMAGE / VIDEO */}
        <div style={{
          height: '260px', background: '#1A1A1A',
          borderRadius: '20px', overflow: 'hidden',
          marginBottom: '24px', border: '1px solid #2A2A2A',
          position: 'relative', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          {promo.photo_url ? (
            promo.photo_url.includes('.mp4') ? (
              <video src={promo.photo_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )
          ) : (
            <span style={{ fontSize: '80px' }}>🏷️</span>
          )}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: '#FF5C00', color: 'white',
            fontSize: '14px', fontWeight: '800',
            padding: '6px 12px', borderRadius: '10px'
          }}>
            -{reduction(promo.prix_original, promo.prix_promo)}%
          </div>
        </div>

        {/* INFOS PRINCIPALES */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>
            {promo.titre}
          </h1>

          {/* VENDEUR + NOTE */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00C48C' }} />
              <span style={{ fontSize: '13px', color: '#888' }}>
                {promo.profiles?.nom}
              </span>
              {promo.profiles?.adresse && (
                <span style={{ fontSize: '13px', color: '#555' }}>
                  · 📍 {promo.profiles.adresse}
                </span>
              )}
            </div>
            {moyenneNote && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: '#1A1A1A', padding: '4px 10px',
                borderRadius: '20px', border: '1px solid #2A2A2A'
              }}>
                <span style={{ fontSize: '12px' }}>⭐</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{moyenneNote}</span>
                <span style={{ fontSize: '11px', color: '#888' }}>({avis.length})</span>
              </div>
            )}
          </div>

          {/* PRIX */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#FF5C00' }}>
              {promo.prix_promo.toLocaleString()} FCFA
            </span>
            <span style={{ fontSize: '16px', color: '#555', textDecoration: 'line-through' }}>
              {promo.prix_original.toLocaleString()} FCFA
            </span>
          </div>
        </div>

        {/* DETAILS */}
        <div style={{
          background: '#1A1A1A', borderRadius: '16px',
          padding: '16px', border: '1px solid #2A2A2A',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>Détails</div>
          {[
            { label: 'Catégorie', value: promo.categorie },
            { label: 'Stock disponible', value: `${promo.stock} article(s)` },
            { label: 'Localisation', value: [promo.ville, promo.pays].filter(Boolean).join(', ') || 'Non précisé' },
            { label: 'Expire le', value: promo.date_expiration ? new Date(promo.date_expiration).toLocaleDateString('fr-FR') : 'Non précisé' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#888' }}>{item.label}</span>
              <span style={{ fontWeight: '500' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* DESCRIPTION */}
        {promo.description && (
          <div style={{
            background: '#1A1A1A', borderRadius: '16px',
            padding: '16px', border: '1px solid #2A2A2A',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Description</div>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>{promo.description}</div>
          </div>
        )}

        {/* RECAP RESERVATION */}
        <div style={{
          background: 'rgba(255,92,0,0.08)', borderRadius: '16px',
          padding: '16px', border: '1px solid rgba(255,92,0,0.2)',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#FF5C00' }}>
            🔒 Système de réservation
          </div>
          {[
            { label: 'Acompte à payer maintenant (20%)', value: `${acompte.toLocaleString()} FCFA`, color: '#FF5C00' },
            { label: 'Reste à payer en boutique (80%)', value: `${restant.toLocaleString()} FCFA`, color: 'white' },
            { label: 'Réservation valable', value: '3 mois', color: 'white' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#888' }}>{item.label}</span>
              <span style={{ fontWeight: '700', color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* AVIS */}
        {avis.length > 0 && (
          <div style={{
            background: '#1A1A1A', borderRadius: '16px',
            padding: '16px', border: '1px solid #2A2A2A',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700' }}>
                Avis clients
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>⭐</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#FF5C00' }}>{moyenneNote}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>/ 5 · {avis.length} avis</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {avis.map(a => (
                <div key={a.id} style={{
                  background: '#252525', borderRadius: '12px',
                  padding: '12px', border: '1px solid #2A2A2A'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>
                      {a.client?.nom || 'Client anonyme'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#FFB800' }}>
                      {'⭐'.repeat(a.note)}
                    </div>
                  </div>
                  {a.commentaire && (
                    <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
                      {a.commentaire}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '6px' }}>
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOUTONS */}
        <button
          onClick={handleReserver}
          style={{
            width: '100%', padding: '16px',
            background: promo.stock === 0 ? '#333' : '#FF5C00',
            border: 'none', borderRadius: '14px', color: 'white',
            fontWeight: '700', fontSize: '15px',
            cursor: promo.stock === 0 ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
          disabled={promo.stock === 0}
        >
          {promo.stock === 0 ? '😔 Stock épuisé' : `🔒 Réserver — Payer ${acompte.toLocaleString()} FCFA`}
        </button>

        <button
          onClick={() => router.push(`/chat/${promo.vendeur_id}?promo=${id}`)}
          style={{
            width: '100%', padding: '14px',
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '14px', color: 'white',
            fontWeight: '500', fontSize: '14px', cursor: 'pointer'
          }}
        >
          💬 Contacter le vendeur
        </button>

        <div style={{ textAlign: 'center', fontSize: '11px', color: '#555', marginTop: '12px', lineHeight: '1.5' }}>
          Les fonds sont sécurisés par Promo's World jusqu'à confirmation de la transaction
        </div>
      </div>
    </div>
  )
}