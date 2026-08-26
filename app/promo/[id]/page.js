'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PromoDetails() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadPage()
    }
  }, [id])

  const loadPage = async () => {
    setLoading(true)
    setError('')

    const { data: authData } = await supabase.auth.getUser()

    if (authData?.user) {
      setUser(authData.user)
    }

    const { data, error: promoError } = await supabase
      .from('promotions')
      .select(`
        *,
        profiles(
          id,
          nom,
          adresse,
          telephone
        )
      `)
      .eq('id', id)
      .single()

    if (promoError) {
      console.error('Erreur promotion:', promoError)
      setError('Impossible de récupérer cette promotion.')
      setLoading(false)
      return
    }

    setPromo(data)
    setLoading(false)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const handleReservation = () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!promo) return

    if (promo.statut !== 'actif') {
      alert('Cette promotion n’est pas active.')
      return
    }

    if (Number(promo.stock) <= 0) {
      alert('Cette promotion est actuellement en rupture de stock.')
      return
    }

    router.push(`/reserver/${promo.id}`)
  }

  const handleAchatDirect = () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!promo) return

    if (promo.statut !== 'actif') {
      alert('Cette promotion n’est pas active.')
      return
    }

    if (Number(promo.stock) <= 0) {
      alert('Cette promotion est actuellement en rupture de stock.')
      return
    }

    router.push(`/acheter/${promo.id}`)
  }

  const handleChat = () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (!promo?.vendeur_id) return

    if (promo.vendeur_id === user.id) {
      alert('Vous êtes le vendeur de cette promotion.')
      return
    }

    router.push(`/chat/${promo.vendeur_id}`)
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

  if (error || !promo) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          color: 'white',
          fontFamily: 'sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '500px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '45px',
              marginBottom: '15px',
            }}
          >
            😕
          </div>

          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              marginBottom: '8px',
            }}
          >
            Promotion introuvable
          </div>

          <div
            style={{
              color: '#888',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error || 'Cette promotion n’existe plus ou n’est plus disponible.'}
          </div>

          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 20px',
              background: '#FF5C00',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  const stock = Number(promo.stock || 0)
  const prix = Number(promo.prix_promo || 0)
  const prixNormal = Number(promo.prix_normal || 0)

  const reduction =
    prixNormal > 0 && prix < prixNormal
      ? Math.round(((prixNormal - prix) / prixNormal) * 100)
      : 0

  const isActive = promo.statut === 'actif'
  const isOutOfStock = stock <= 0

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
          height: '64px',
          background: '#0A0A0A',
          borderBottom: '1px solid #1E1E1E',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
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
          Promo's
          <span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: '84px 20px 50px',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        {/* IMAGE */}
        <div
          style={{
            width: '100%',
            height: '340px',
            background: '#151515',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          {promo.photo_url ? (
            promo.media_type === 'video' ? (
              <video
                src={promo.photo_url}
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <img
                src={promo.photo_url}
                alt={promo.titre || 'Promotion'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '50px',
              }}
            >
              🛍️
            </div>
          )}

          {reduction > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: '#FF5C00',
                color: 'white',
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '900',
              }}
            >
              -{reduction}%
            </div>
          )}

          {!isActive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '800',
              }}
            >
              Promotion inactive
            </div>
          )}
        </div>

        {/* INFORMATIONS */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: '900',
              lineHeight: '1.25',
              marginBottom: '10px',
            }}
          >
            {promo.titre}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#999',
              marginBottom: '18px',
            }}
          >
            🏪
            <span>
              {promo.profiles?.nom || 'Vendeur'}
            </span>
          </div>

          {/* PRIX */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                fontWeight: '900',
                color: '#FF5C00',
              }}
            >
              {formatMoney(prix)} FCFA
            </span>

            {prixNormal > prix && (
              <span
                style={{
                  color: '#777',
                  fontSize: '14px',
                  textDecoration: 'line-through',
                }}
              >
                {formatMoney(prixNormal)} FCFA
              </span>
            )}
          </div>

          {/* STOCK */}
          <div
            style={{
              fontSize: '13px',
              color: isOutOfStock ? '#FF3C3C' : '#00C48C',
              fontWeight: '700',
              marginBottom: '18px',
            }}
          >
            {isOutOfStock
              ? '❌ Rupture de stock'
              : `✓ ${stock} article${stock > 1 ? 's' : ''} disponible${stock > 1 ? 's' : ''}`}
          </div>

          {/* DESCRIPTION */}
          {promo.description && (
            <div
              style={{
                borderTop: '1px solid #292929',
                paddingTop: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  marginBottom: '8px',
                }}
              >
                Description
              </div>

              <div
                style={{
                  color: '#AAA',
                  fontSize: '13px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {promo.description}
              </div>
            </div>
          )}
        </div>

        {/* VENDEUR */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '800',
              marginBottom: '12px',
            }}
          >
            👤 Informations vendeur
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#AAA',
              lineHeight: '1.8',
            }}
          >
            <div>
              <span style={{ color: '#666' }}>Nom : </span>
              {promo.profiles?.nom || '-'}
            </div>

            <div>
              <span style={{ color: '#666' }}>Adresse : </span>
              {promo.profiles?.adresse || 'Non précisée'}
            </div>
          </div>

          {user && promo.vendeur_id !== user.id && (
            <button
              onClick={handleChat}
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '11px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              💬 Contacter le vendeur
            </button>
          )}
        </div>

        {/* ACTIONS */}
        <div
          style={{
            position: 'sticky',
            bottom: '12px',
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <button
            onClick={handleReservation}
            disabled={!isActive || isOutOfStock}
            style={{
              padding: '14px 10px',
              background:
                !isActive || isOutOfStock
                  ? '#333'
                  : '#FF5C00',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '900',
              cursor:
                !isActive || isOutOfStock
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            📌 Réserver
          </button>

          <button
            onClick={handleAchatDirect}
            disabled={!isActive || isOutOfStock}
            style={{
              padding: '14px 10px',
              background:
                !isActive || isOutOfStock
                  ? '#333'
                  : '#00C48C',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '900',
              cursor:
                !isActive || isOutOfStock
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            🛒 Acheter
          </button>
        </div>

        {/* EXPLICATION DU SYSTÈME */}
        <div
          style={{
            marginTop: '18px',
            background: 'rgba(255,92,0,0.06)',
            border: '1px solid rgba(255,92,0,0.18)',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '12px',
            color: '#888',
            lineHeight: '1.7',
          }}
        >
          🔒 <strong style={{ color: '#AAA' }}>
            Paiement sécurisé Promo’s World
          </strong>
          <br />
          Pour une réservation ou un achat, les fonds sont protégés
          jusqu’à la validation prévue par le système.
        </div>
      </div>
    </div>
  )
}