'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Toutes')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)

    const { data: authData } = await supabase.auth.getUser()

    if (authData?.user) {
      setUser(authData.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle()

      setProfile(profileData)
    }

    await loadPromotions()

    setLoading(false)
  }

  const loadPromotions = async () => {
    const { data, error } = await supabase
      .from('promotions')
      .select(`
        *,
        profiles (
          nom,
          adresse
        )
      `)
      .eq('statut', 'actif')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement promotions :', error)
      setPromotions([])
      return
    }

    setPromotions(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const categories = [
    'Toutes',
    ...Array.from(
      new Set(
        promotions
          .map((promo) => promo.categorie)
          .filter(Boolean)
      )
    ),
  ]

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      !search.trim() ||
      promo.titre?.toLowerCase().includes(search.toLowerCase()) ||
      promo.description?.toLowerCase().includes(search.toLowerCase()) ||
      promo.categorie?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'Toutes' ||
      promo.categorie === category

    return matchesSearch && matchesCategory
  })

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
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1E1E1E',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* LOGO */}
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5C00',
              fontSize: '19px',
              fontWeight: '900',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Promo's<span style={{ color: 'white' }}>World</span>
          </button>

          {/* SEARCH */}
          <div
            style={{
              flex: 1,
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une promotion..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '11px 14px',
                background: '#151515',
                border: '1px solid #2A2A2A',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          {/* NAVIGATION */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {user ? (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    padding: '9px 12px',
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => router.push('/profil')}
                  style={{
                    width: '38px',
                    height: '38px',
                    background: '#FF5C00',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '800',
                  }}
                >
                  {profile?.nom
                    ? profile.nom.charAt(0).toUpperCase()
                    : '👤'}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                style={{
                  padding: '10px 14px',
                  background: '#FF5C00',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '800',
                }}
              >
                Se connecter
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '55px 20px 30px',
        }}
      >
        <div
          style={{
            background:
              'linear-gradient(135deg, #171717 0%, #111 60%, #18100A 100%)',
            border: '1px solid #292929',
            borderRadius: '24px',
            padding: '35px 28px',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: '999px',
              background: 'rgba(255,92,0,0.1)',
              border: '1px solid rgba(255,92,0,0.25)',
              color: '#FF8A45',
              fontSize: '11px',
              fontWeight: '800',
              marginBottom: '14px',
            }}
          >
            🔥 LES BONNES AFFAIRES
          </div>

          <h1
            style={{
              margin: '0 0 12px',
              fontSize: 'clamp(30px, 5vw, 52px)',
              lineHeight: 1.05,
              fontWeight: '900',
            }}
          >
            Trouve les meilleures
            <span style={{ color: '#FF5C00' }}> promos.</span>
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: '650px',
              color: '#999',
              fontSize: '14px',
              lineHeight: 1.7,
            }}
          >
            Découvre des offres proposées par des vendeurs,
            réserve un article ou achète directement en toute sécurité.
          </p>

          {!user && (
            <button
              onClick={() => router.push('/auth')}
              style={{
                marginTop: '22px',
                padding: '12px 18px',
                background: '#FF5C00',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Commencer
            </button>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '10px 20px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '5px',
          }}
        >
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              style={{
                flexShrink: 0,
                padding: '9px 14px',
                borderRadius: '999px',
                border:
                  category === item
                    ? '1px solid #FF5C00'
                    : '1px solid #2A2A2A',
                background:
                  category === item
                    ? 'rgba(255,92,0,0.12)'
                    : '#151515',
                color:
                  category === item
                    ? '#FF7A2A'
                    : '#AAA',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* PROMOTIONS */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '10px 20px 50px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '900',
              }}
            >
              Promotions
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#777',
                marginTop: '4px',
              }}
            >
              {filteredPromotions.length} offre
              {filteredPromotions.length > 1 ? 's' : ''}
            </div>
          </div>

          {user && (
            <button
              onClick={() => router.push('/promo')}
              style={{
                padding: '9px 12px',
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '10px',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              + Publier une promo
            </button>
          )}
        </div>

        {loading ? (
          <div
            style={{
              padding: '70px 20px',
              textAlign: 'center',
              color: '#777',
            }}
          >
            Chargement des promotions...
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div
            style={{
              background: '#151515',
              border: '1px solid #252525',
              borderRadius: '18px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px',
              }}
            >
              🔎
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                marginBottom: '6px',
              }}
            >
              Aucune promotion trouvée
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#777',
              }}
            >
              Essaie une autre recherche ou une autre catégorie.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '14px',
            }}
          >
            {filteredPromotions.map((promo) => {
              const stock = Number(promo.stock || 0)

              return (
                <div
                  key={promo.id}
                  onClick={() =>
                    router.push(`/promo/${promo.id}`)
                  }
                  style={{
                    background: '#151515',
                    border: '1px solid #252525',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                >
                  {/* IMAGE */}
                  <div
                    style={{
                      height: '190px',
                      background: '#202020',
                      overflow: 'hidden',
                    }}
                  >
                    {promo.photo_url ? (
                      <img
                        src={promo.photo_url}
                        alt={promo.titre || 'Promotion'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#555',
                          fontSize: '35px',
                        }}
                      >
                        🛍️
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div style={{ padding: '14px' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        marginBottom: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {promo.titre || 'Promotion'}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#777',
                        marginBottom: '10px',
                      }}
                    >
                      {promo.profiles?.nom || 'Vendeur'}
                      {promo.categorie
                        ? ` · ${promo.categorie}`
                        : ''}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          color: '#FF5C00',
                          fontSize: '16px',
                          fontWeight: '900',
                        }}
                      >
                        {formatMoney(promo.prix_promo)} FCFA
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color:
                            stock > 0
                              ? '#00C48C'
                              : '#FF3C3C',
                          fontWeight: '700',
                        }}
                      >
                        {stock > 0
                          ? `${stock} disponible${stock > 1 ? 's' : ''}`
                          : 'Épuisé'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid #1E1E1E',
          padding: '25px 20px',
          color: '#666',
          fontSize: '11px',
          textAlign: 'center',
        }}
      >
        Promo's World · Marketplace de promotions
      </footer>
    </div>
  )
}