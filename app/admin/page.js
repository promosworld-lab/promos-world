'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()

  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('en_attente')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    setLoading(true)

    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/auth')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    await fetchPromotions()
  }

  const fetchPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*, profiles(nom, telephone, adresse)')
      .order('created_at', { ascending: false })

    if (!error) {
      setPromotions(data || [])
    }

    setLoading(false)
  }

  const handleAction = async (id, statut) => {
    setMessage('')

    const { error } = await supabase
      .from('promotions')
      .update({ statut })
      .eq('id', id)

    if (error) {
      setMessage(`Erreur : ${error.message}`)
      return
    }

    setMessage(statut === 'actif' ? '✅ Promo approuvée.' : '❌ Promo rejetée.')
    await fetchPromotions()
    setTimeout(() => setMessage(''), 3000)
  }

  const promosFiltrees = promotions.filter(promo => promo.statut === onglet)

  const onglets = [
    { key: 'en_attente', label: '⏳ En attente', color: '#FFB800' },
    { key: 'actif', label: '✅ Actives', color: '#00C48C' },
    { key: 'rejete', label: '❌ Rejetées', color: '#FF3C3C' },
    { key: 'expire', label: '⌛ Expirées', color: '#888' },
  ]

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

  const reduction = (original, promo) => {
    if (!original || !promo) return 0
    return Math.round((1 - Number(promo) / Number(original)) * 100)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
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
        justifyContent: 'space-between',
        zIndex: 100,
        gap: '12px',
      }}>
        <div onClick={() => router.push('/')} style={{ fontSize: '20px', fontWeight: '800', color: '#FF5C00', cursor: 'pointer' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
          <span style={{
            fontSize: '11px',
            background: '#FF5C00',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '6px',
            marginLeft: '10px',
            fontWeight: '600',
            verticalAlign: 'middle',
          }}>
            ADMIN
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push('/admin/transactions')} style={{
            padding: '8px 12px',
            background: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            💳 Transactions
          </button>

          <button onClick={() => router.push('/admin/litiges')} style={{
            padding: '8px 12px',
            background: '#1A1A1A',
            border: '1px solid #333',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            ⚠️ Litiges
          </button>

          <button onClick={logout} style={{
            padding: '8px 14px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '8px',
            color: '#888',
            fontSize: '12px',
            cursor: 'pointer',
          }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: '85px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            ⚙️ Panel Admin
          </div>

          <div style={{ fontSize: '13px', color: '#888' }}>
            Validation des promotions publiées par les vendeurs.
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'En attente', value: promotions.filter(p => p.statut === 'en_attente').length, color: '#FFB800' },
            { label: 'Actives', value: promotions.filter(p => p.statut === 'actif').length, color: '#00C48C' },
            { label: 'Rejetées', value: promotions.filter(p => p.statut === 'rejete').length, color: '#FF3C3C' },
            { label: 'Expirées', value: promotions.filter(p => p.statut === 'expire').length, color: '#888' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#1A1A1A',
              borderRadius: '14px',
              padding: '16px',
              border: '1px solid #2A2A2A',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: stat.color }}>
                {stat.value}
              </div>

              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: message.includes('Erreur') || message.includes('rejetée') ? 'rgba(255,60,60,0.1)' : 'rgba(0,196,140,0.1)',
            border: `1px solid ${message.includes('Erreur') || message.includes('rejetée') ? '#FF3C3C' : '#00C48C'}`,
            color: message.includes('Erreur') || message.includes('rejetée') ? '#FF3C3C' : '#00C48C',
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
                padding: '8px 16px',
                borderRadius: '10px',
                border: onglet === o.key ? `1px solid ${o.color}` : '1px solid #2A2A2A',
                background: onglet === o.key ? '#1A1A1A' : '#111',
                color: onglet === o.key ? o.color : '#888',
                fontSize: '13px',
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
                {promotions.filter(p => p.statut === o.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
            Chargement...
          </div>
        ) : promosFiltrees.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#888',
            padding: '60px 20px',
            background: '#1A1A1A',
            borderRadius: '16px',
            border: '1px solid #2A2A2A',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              Aucune promo dans cet onglet
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {promosFiltrees.map(promo => {
              const isVideo = promo.media_type === 'video' || promo.photo_url?.includes('.mp4')

              return (
                <div key={promo.id} style={{
                  background: '#1A1A1A',
                  borderRadius: '16px',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', gap: '14px', padding: '16px' }}>
                    <div style={{
                      width: '90px',
                      height: '90px',
                      background: '#252525',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {promo.photo_url ? (
                        isVideo ? (
                          <video src={promo.photo_url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )
                      ) : (
                        <span style={{ fontSize: '34px' }}>🏷️</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '8px',
                      }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
                            {promo.titre}
                          </div>

                          <div style={{ fontSize: '12px', color: '#888' }}>
                            🏪 {promo.profiles?.nom || 'Vendeur'} · {promo.created_at ? new Date(promo.created_at).toLocaleDateString('fr-FR') : '-'}
                          </div>

                          {(promo.ville || promo.pays) && (
                            <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
                              📍 {[promo.ville, promo.pays].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>

                        <div style={{
                          background: '#FF5C00',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          flexShrink: 0,
                        }}>
                          -{reduction(promo.prix_original, promo.prix_promo)}%
                        </div>
                      </div>

                      {promo.description && (
                        <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', lineHeight: '1.5' }}>
                          {promo.description}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '14px', fontSize: '13px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#FF5C00', fontWeight: '700' }}>
                          {formatMoney(promo.prix_promo)} FCFA
                        </span>

                        <span style={{ color: '#555', textDecoration: 'line-through' }}>
                          {formatMoney(promo.prix_original)} FCFA
                        </span>

                        <span style={{ color: '#888' }}>
                          Stock : {promo.stock}
                        </span>

                        <span style={{ color: '#888' }}>
                          Catégorie : {promo.categorie || '-'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => router.push(`/promo/${promo.id}`)}
                          style={{
                            padding: '10px 14px',
                            background: '#111',
                            border: '1px solid #333',
                            borderRadius: '10px',
                            color: 'white',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Voir détails
                        </button>

                        {onglet === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleAction(promo.id, 'actif')}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(0,196,140,0.15)',
                                border: '1px solid #00C48C',
                                borderRadius: '10px',
                                color: '#00C48C',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              ✓ Approuver
                            </button>

                            <button
                              onClick={() => handleAction(promo.id, 'rejete')}
                              style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(255,60,60,0.1)',
                                border: '1px solid #FF3C3C',
                                borderRadius: '10px',
                                color: '#FF3C3C',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              ✕ Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </div>
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