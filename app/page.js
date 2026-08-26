'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function Home() {
  const router = useRouter()
  const { language, setLanguage, t, ready } = useLanguage()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [mobileMenu, setMobileMenu] = useState(false)

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
    return Number(value || 0).toLocaleString(
      language === 'fr' ? 'fr-FR' : 'en-US'
    )
  }

  const categories = [
    t.all,
    ...Array.from(
      new Set(
        promotions
          .map((promo) => promo.categorie)
          .filter(Boolean)
      )
    ),
  ]

  const selectedCategory =
    category === 'Toutes' || category === 'All'
      ? t.all
      : category

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      !search.trim() ||
      promo.titre?.toLowerCase().includes(search.toLowerCase()) ||
      promo.description?.toLowerCase().includes(search.toLowerCase()) ||
      promo.categorie?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === t.all ||
      promo.categorie === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-sm text-gray-500">
          Chargement...
        </div>
      </div>
    )
  }

  return (
    <div className="home-page">
      <style jsx>{`
        .home-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e1e1e;
        }

        .header-inner {
          min-height: 68px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-sizing: border-box;
        }

        .logo {
          flex-shrink: 0;
          background: none;
          border: none;
          color: #ff5c00;
          font-size: 19px;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .search-wrapper {
          flex: 1;
          max-width: 560px;
          margin: 0 auto;
        }

        .search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 14px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          color: white;
          outline: none;
          font-size: 13px;
        }

        .desktop-navigation {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .language-button {
          padding: 9px 11px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .mobile-menu-button {
          display: none;
          width: 40px;
          height: 40px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          font-size: 20px;
        }

        .mobile-menu {
          display: none;
        }

        .hero-section {
          padding: 55px 20px 30px;
        }

        .hero {
          background:
            linear-gradient(
              135deg,
              #171717 0%,
              #111 60%,
              #18100a 100%
            );
          border: 1px solid #292929;
          border-radius: 24px;
          padding: 35px 28px;
        }

        .hero-title {
          margin: 0 0 12px;
          font-size: clamp(30px, 5vw, 52px);
          line-height: 1.05;
          font-weight: 900;
        }

        .hero-description {
          margin: 0;
          max-width: 650px;
          color: #999;
          font-size: 14px;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .categories-section {
          padding: 10px 20px 20px;
        }

        .categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 5px;
          scrollbar-width: none;
        }

        .categories::-webkit-scrollbar {
          display: none;
        }

        .promotions-section {
          padding: 10px 20px 50px;
        }

        .promotions-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .promotions-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(220px, 1fr)
          );
          gap: 14px;
        }

        .promo-card {
          min-width: 0;
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.15s ease,
            border-color 0.15s ease;
        }

        .promo-card:hover {
          transform: translateY(-2px);
          border-color: #3a3a3a;
        }

        .promo-image {
          height: 190px;
          background: #202020;
          overflow: hidden;
        }

        .promo-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .promo-content {
          padding: 14px;
        }

        .promo-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .footer {
          border-top: 1px solid #1e1e1e;
          padding: 25px 20px;
          color: #666;
          font-size: 11px;
          text-align: center;
        }

        .primary-button {
          padding: 12px 18px;
          background: #ff5c00;
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .secondary-button {
          padding: 12px 18px;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .header-inner {
            padding: 10px 14px;
            gap: 10px;
          }

          .desktop-navigation {
            display: none;
          }

          .mobile-menu-button {
            display: block;
            flex-shrink: 0;
          }

          .search-wrapper {
            max-width: none;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 12px 14px 16px;
            border-top: 1px solid #1e1e1e;
            background: #0d0d0d;
          }

          .hero-section {
            padding: 24px 14px 20px;
          }

          .hero {
            border-radius: 18px;
            padding: 28px 20px;
          }

          .categories-section {
            padding: 8px 14px 18px;
          }

          .promotions-section {
            padding: 8px 14px 35px;
          }

          .promotions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .promo-image {
            height: 160px;
          }

          .promo-content {
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .logo {
            font-size: 17px;
          }

          .search-input {
            font-size: 12px;
            padding: 10px 11px;
          }

          .hero-title {
            font-size: 34px;
          }

          .hero-description {
            font-size: 13px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-actions button {
            width: 100%;
          }

          .promotions-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .promotions-heading button {
            width: 100%;
          }

          .promotions-grid {
            grid-template-columns: 1fr;
          }

          .promo-image {
            height: 210px;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="container header-inner">
          <button
            onClick={() => router.push('/')}
            className="logo"
          >
            Promo's<span style={{ color: 'white' }}>World</span>
          </button>

          <div className="search-wrapper">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="search-input"
            />
          </div>

          <div className="desktop-navigation">
            <button
              className="language-button"
              onClick={() =>
                setLanguage(language === 'fr' ? 'en' : 'fr')
              }
            >
              {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>

            <button
              onClick={() => router.push('/a-propos')}
              className="language-button"
            >
              ℹ️
            </button>

            {user ? (
              <>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="language-button"
                >
                  {t.dashboard}
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
                className="primary-button"
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                }}
              >
                {t.login}
              </button>
            )}
          </div>

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            {mobileMenu ? '×' : '☰'}
          </button>
        </div>

        {mobileMenu && (
          <div className="mobile-menu">
            <button
              className="secondary-button"
              onClick={() =>
                setLanguage(language === 'fr' ? 'en' : 'fr')
              }
            >
              {language === 'fr'
                ? '🇬🇧 English'
                : '🇫🇷 Français'}
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setMobileMenu(false)
                router.push('/a-propos')
              }}
            >
              ℹ️ {t.discoverPromoWorld}
            </button>

            {user ? (
              <>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setMobileMenu(false)
                    router.push('/dashboard')
                  }}
                >
                  {t.dashboard}
                </button>

                <button
                  className="primary-button"
                  onClick={() => {
                    setMobileMenu(false)
                    router.push('/profil')
                  }}
                >
                  👤 {profile?.nom || 'Profil'}
                </button>

                <button
                  className="secondary-button"
                  onClick={() => {
                    setMobileMenu(false)
                    handleLogout()
                  }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <button
                className="primary-button"
                onClick={() => {
                  setMobileMenu(false)
                  router.push('/auth')
                }}
              >
                {t.login}
              </button>
            )}
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="container hero-section">
        <div className="hero">
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
            {t.discoverBadge}
          </div>

          <h1 className="hero-title">
            {t.heroTitle}
            <span style={{ color: '#FF5C00' }}>
              {t.heroTitleAccent}
            </span>
          </h1>

          <p className="hero-description">
            {t.heroDescription}
          </p>

          <div className="hero-actions">
            {!user && (
              <button
                onClick={() => router.push('/auth')}
                className="primary-button"
              >
                {t.start}
              </button>
            )}

            <button
              onClick={() => router.push('/a-propos')}
              className="secondary-button"
            >
              ℹ️ {t.discoverPromoWorld}
            </button>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container categories-section">
        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              style={{
                flexShrink: 0,
                padding: '9px 14px',
                borderRadius: '999px',
                border:
                  selectedCategory === item
                    ? '1px solid #FF5C00'
                    : '1px solid #2A2A2A',
                background:
                  selectedCategory === item
                    ? 'rgba(255,92,0,0.12)'
                    : '#151515',
                color:
                  selectedCategory === item
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
      <main className="container promotions-section">
        <div className="promotions-heading">
          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: '900',
              }}
            >
              {t.promotions}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#777',
                marginTop: '4px',
              }}
            >
              {filteredPromotions.length}{' '}
              {filteredPromotions.length > 1
                ? t.offers
                : t.offer}
            </div>
          </div>

          {user && (
            <button
              onClick={() => router.push('/promo')}
              className="secondary-button"
              style={{
                padding: '9px 12px',
                fontSize: '12px',
              }}
            >
              {t.publishPromo}
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
            {t.loading}
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
              {t.noPromotion}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#777',
              }}
            >
              {t.tryAgain}
            </div>
          </div>
        ) : (
          <div className="promotions-grid">
            {filteredPromotions.map((promo) => {
              const stock = Number(promo.stock || 0)

              return (
                <div
                  key={promo.id}
                  onClick={() =>
                    router.push(`/promo/${promo.id}`)
                  }
                  className="promo-card"
                >
                  <div className="promo-image">
                    {promo.photo_url ? (
                      <img
                        src={promo.photo_url}
                        alt={promo.titre || t.promotions}
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

                  <div className="promo-content">
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
                      {promo.titre || t.promotions}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#777',
                        marginBottom: '10px',
                      }}
                    >
                      {promo.profiles?.nom || t.seller}
                      {promo.categorie
                        ? ` · ${promo.categorie}`
                        : ''}
                    </div>

                    <div className="promo-price-row">
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
                          textAlign: 'right',
                        }}
                      >
                        {stock > 0
                          ? `${stock} ${
                              stock > 1
                                ? t.availables
                                : t.available
                            }`
                          : t.soldOut}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="footer">
        {t.footer}
      </footer>
    </div>
  )
}