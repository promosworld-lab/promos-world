'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [categorie, setCategorie] = useState('Tout')
  const [recherche, setRecherche] = useState('')
  const [pays, setPays] = useState('')
  const [ville, setVille] = useState('')
  const [loading, setLoading] = useState(true)

  const categories = ['Tout', '👗 Mode', '📱 Tech', '🍔 Food', '🏠 Maison', '💄 Beauté', '👟 Chaussures']

  useEffect(() => {
    checkUser()
    fetchPromotions()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const fetchPromotions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promotions')
      .select(`*, profiles(nom)`)
      .eq('statut', 'actif')
      .order('created_at', { ascending: false })

    if (!error) setPromotions(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const promotionsFiltrees = promotions.filter(p => {
    const matchCategorie = categorie === 'Tout' || p.categorie === categorie
    const matchRecherche = p.titre.toLowerCase().includes(recherche.toLowerCase())
    const matchPays = pays === '' || (p.pays && p.pays.toLowerCase().includes(pays.toLowerCase()))
    const matchVille = ville === '' || (p.ville && p.ville.toLowerCase().includes(ville.toLowerCase()))
    return matchCategorie && matchRecherche && matchPays && matchVille
  })

  const reduction = (original, promo) => Math.round((1 - promo / original) * 100)

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
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {user ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '8px 16px', background: '#1A1A1A',
                  border: '1px solid #333', borderRadius: '8px',
                  color: 'white', fontSize: '13px', cursor: 'pointer'
                }}
              >
                🏪 Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px', background: 'transparent',
                  border: '1px solid #333', borderRadius: '8px',
                  color: '#888', fontSize: '13px', cursor: 'pointer'
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              style={{
                padding: '8px 20px', background: '#FF5C00',
                border: 'none', borderRadius: '8px',
                color: 'white', fontSize: '13px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              Connexion
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingTop: '70px' }}>

        {/* HERO */}
        <div style={{ padding: '40px 20px 20px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,92,0,0.1)',
            border: '1px solid rgba(255,92,0,0.3)',
            borderRadius: '20px', padding: '4px 14px',
            fontSize: '12px', color: '#FF5C00', marginBottom: '16px'
          }}>
            🔥 Les meilleures promos près de chez toi
          </div>
          <h1 style={{
            fontSize: '32px', fontWeight: '800',
            marginBottom: '10px', lineHeight: '1.2'
          }}>
            Trouve les promos,<br />
            <span style={{ color: '#FF5C00' }}>économise plus</span>
          </h1>
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
            Des centaines de promotions de vendeurs près de toi
          </p>

          {/* BARRE DE RECHERCHE */}
          <div style={{
            maxWidth: '500px', margin: '0 auto',
            background: '#1A1A1A', borderRadius: '14px',
            padding: '12px 16px', display: 'flex',
            alignItems: 'center', gap: '10px',
            border: '1px solid #2A2A2A'
          }}>
            <span>🔍</span>
            <input
              type="text"
              placeholder="Chercher une promo..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{
                flex: 1, background: 'transparent',
                border: 'none', color: 'white',
                fontSize: '14px', outline: 'none'
              }}
            />
          </div>
        </div>

        {/* FILTRES LOCALISATION */}
        <div style={{
          display: 'flex', gap: '10px',
          padding: '0 20px 16px',
          maxWidth: '500px', margin: '0 auto'
        }}>
          <input
            type="text"
            placeholder="🌍 Pays"
            value={pays}
            onChange={e => setPays(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px',
              background: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: '10px', color: 'white',
              fontSize: '13px', outline: 'none'
            }}
          />
          <input
            type="text"
            placeholder="📍 Ville"
            value={ville}
            onChange={e => setVille(e.target.value)}
            style={{
              flex: 1, padding: '10px 14px',
              background: '#1A1A1A', border: '1px solid #2A2A2A',
              borderRadius: '10px', color: 'white',
              fontSize: '13px', outline: 'none'
            }}
          />
        </div>

        {/* CATEGORIES */}
        <div style={{
          display: 'flex', gap: '8px',
          padding: '0 20px 20px', overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategorie(cat)}
              style={{
                flexShrink: 0, padding: '8px 16px',
                borderRadius: '20px',
                background: categorie === cat ? '#FF5C00' : '#1A1A1A',
                color: categorie === cat ? 'white' : '#888',
                fontSize: '13px', fontWeight: '500',
                cursor: 'pointer',
                border: categorie === cat ? 'none' : '1px solid #2A2A2A'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLE DE PROMOS */}
        <div style={{ padding: '0 20px 40px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
            🔥 Promos du moment
            {(pays || ville || recherche || categorie !== 'Tout') && (
              <span
                onClick={() => { setPays(''); setVille(''); setRecherche(''); setCategorie('Tout') }}
                style={{
                  fontSize: '12px', color: '#FF5C00',
                  marginLeft: '12px', cursor: 'pointer',
                  fontWeight: '400'
                }}
              >
                Réinitialiser les filtres ✕
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>
              Chargement...
            </div>
          ) : promotionsFiltrees.length === 0 ? (
            <div style={{
              textAlign: 'center', color: '#888', padding: '60px 20px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
                Aucune promo disponible
              </div>
              <div style={{ fontSize: '13px' }}>
                Reviens bientôt ou change de filtre
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {promotionsFiltrees.map(promo => (
                <div
                  key={promo.id}
                  onClick={() => router.push(`/promo/${promo.id}`)}
                  style={{
                    background: '#1A1A1A', borderRadius: '16px',
                    overflow: 'hidden', border: '1px solid #2A2A2A',
                    cursor: 'pointer', transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* IMAGE / VIDEO */}
                  <div style={{
                    height: '180px', background: '#252525',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', position: 'relative',
                    overflow: 'hidden', borderBottom: '1px solid #2A2A2A'
                  }}>
                    {promo.photo_url ? (
                      promo.photo_url.includes('.mp4') ? (
                        <video
                          src={promo.photo_url}
                          muted autoPlay loop
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <img
                          src={promo.photo_url}
                          alt={promo.titre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )
                    ) : (
                      <span style={{ fontSize: '48px' }}>🏷️</span>
                    )}
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      background: '#FF5C00', color: 'white',
                      fontSize: '11px', fontWeight: '700',
                      padding: '3px 8px', borderRadius: '6px'
                    }}>
                      -{reduction(promo.prix_original, promo.prix_promo)}%
                    </div>
                  </div>

                  {/* INFOS */}
                  <div style={{ padding: '14px' }}>
                    <div style={{
                      fontSize: '14px', fontWeight: '600',
                      marginBottom: '4px', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {promo.titre}
                    </div>
                    <div style={{
                      fontSize: '12px', color: '#888', marginBottom: '4px'
                    }}>
                      {promo.profiles?.nom}
                    </div>
                    {(promo.ville || promo.pays) && (
                      <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>
                        📍 {[promo.ville, promo.pays].filter(Boolean).join(', ')}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#FF5C00' }}>
                        {promo.prix_promo.toLocaleString()} FCFA
                      </span>
                      <span style={{ fontSize: '12px', color: '#555', textDecoration: 'line-through' }}>
                        {promo.prix_original.toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}