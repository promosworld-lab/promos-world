'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('en_attente')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { router.push('/auth'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') { router.push('/'); return }

    setUser(data.user)
    fetchPromotions()
  }

  const fetchPromotions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promotions')
      .select(`*, profiles(nom)`)
      .order('created_at', { ascending: false })

    if (!error) setPromotions(data || [])
    setLoading(false)
  }

  const handleAction = async (id, statut) => {
    const { error } = await supabase
      .from('promotions')
      .update({ statut })
      .eq('id', id)

    if (error) {
      setMessage('Erreur lors de la mise à jour.')
      return
    }

    setMessage(statut === 'actif' ? '✅ Promo approuvée !' : '❌ Promo rejetée.')
    fetchPromotions()
    setTimeout(() => setMessage(''), 3000)
  }

  const promosFiltrees = promotions.filter(p => p.statut === onglet)

  const onglets = [
    { key: 'en_attente', label: '⏳ En attente', color: '#FFB800' },
    { key: 'actif', label: '✅ Actives', color: '#00C48C' },
    { key: 'rejete', label: '❌ Rejetées', color: '#FF3C3C' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
          <span style={{
            fontSize: '11px', background: '#FF5C00',
            color: 'white', padding: '2px 8px',
            borderRadius: '6px', marginLeft: '10px',
            fontWeight: '600', verticalAlign: 'middle'
          }}>ADMIN</span>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }}
          style={{
            padding: '8px 16px', background: 'transparent',
            border: '1px solid #333', borderRadius: '8px',
            color: '#888', fontSize: '13px', cursor: 'pointer'
          }}
        >
          Déconnexion
        </button>
      </div>

      <div style={{ paddingTop: '80px', padding: '80px 20px 40px', maxWidth: '800px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            ⚙️ Panel Admin
          </div>
          <div style={{ fontSize: '13px', color: '#888' }}>
            Valide ou rejette les promotions soumises par les vendeurs
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px', marginBottom: '24px'
        }}>
          {[
            { label: 'En attente', value: promotions.filter(p => p.statut === 'en_attente').length, color: '#FFB800' },
            { label: 'Actives', value: promotions.filter(p => p.statut === 'actif').length, color: '#00C48C' },
            { label: 'Rejetées', value: promotions.filter(p => p.statut === 'rejete').length, color: '#FF3C3C' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#1A1A1A', borderRadius: '14px',
              padding: '16px', border: '1px solid #2A2A2A',
              textAlign: 'center'
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

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            background: message.includes('approuvée') ? 'rgba(0,196,140,0.1)' : 'rgba(255,60,60,0.1)',
            border: `1px solid ${message.includes('approuvée') ? '#00C48C' : '#FF3C3C'}`,
            color: message.includes('approuvée') ? '#00C48C' : '#FF3C3C',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}

        {/* ONGLETS */}
        <div style={{
          display: 'flex', gap: '8px',
          marginBottom: '20px'
        }}>
          {onglets.map(o => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                border: onglet === o.key ? `1px solid ${o.color}` : '1px solid #2A2A2A',
                background: onglet === o.key ? `rgba(${o.color === '#FFB800' ? '255,184,0' : o.color === '#00C48C' ? '0,196,140' : '255,60,60'},0.1)` : '#1A1A1A',
                color: onglet === o.key ? o.color : '#888',
                fontSize: '13px', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {o.label}
              <span style={{
                marginLeft: '6px', background: '#2A2A2A',
                padding: '1px 6px', borderRadius: '10px',
                fontSize: '11px', color: '#888'
              }}>
                {promotions.filter(p => p.statut === o.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* LISTE */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Chargement...</div>
        ) : promosFiltrees.length === 0 ? (
          <div style={{
            textAlign: 'center', color: '#888',
            padding: '60px 20px', background: '#1A1A1A',
            borderRadius: '16px', border: '1px solid #2A2A2A'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              Aucune promo dans cet onglet
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {promosFiltrees.map(promo => (
              <div key={promo.id} style={{
                background: '#1A1A1A', borderRadius: '16px',
                border: '1px solid #2A2A2A', overflow: 'hidden'
              }}>
                <div style={{ padding: '16px' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start', marginBottom: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
                        {promo.titre}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        🏪 {promo.profiles?.nom} · {new Date(promo.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div style={{
                      background: '#FF5C00', color: 'white',
                      fontSize: '12px', fontWeight: '700',
                      padding: '4px 10px', borderRadius: '8px'
                    }}>
                      -{Math.round((1 - promo.prix_promo / promo.prix_original) * 100)}%
                    </div>
                  </div>

                  {promo.description && (
                    <div style={{
                      fontSize: '12px', color: '#888',
                      marginBottom: '12px', lineHeight: '1.5'
                    }}>
                      {promo.description}
                    </div>
                  )}

                  <div style={{
                    display: 'flex', gap: '16px',
                    fontSize: '13px', marginBottom: '14px'
                  }}>
                    <span style={{ color: '#FF5C00', fontWeight: '700' }}>
                      {promo.prix_promo.toLocaleString()} FCFA
                    </span>
                    <span style={{ color: '#555', textDecoration: 'line-through' }}>
                      {promo.prix_original.toLocaleString()} FCFA
                    </span>
                    <span style={{ color: '#888' }}>
                      Stock: {promo.stock}
                    </span>
                  </div>

                  {onglet === 'en_attente' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleAction(promo.id, 'actif')}
                        style={{
                          flex: 1, padding: '10px',
                          background: 'rgba(0,196,140,0.15)',
                          border: '1px solid #00C48C',
                          borderRadius: '10px', color: '#00C48C',
                          fontSize: '13px', fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Approuver
                      </button>
                      <button
                        onClick={() => handleAction(promo.id, 'rejete')}
                        style={{
                          flex: 1, padding: '10px',
                          background: 'rgba(255,60,60,0.1)',
                          border: '1px solid #FF3C3C',
                          borderRadius: '10px', color: '#FF3C3C',
                          fontSize: '13px', fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Rejeter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}