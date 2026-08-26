'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Acheter() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [id])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    const { data: promoData, error: promoError } = await supabase
      .from('promotions')
      .select(`
        *,
        profiles(nom, adresse)
      `)
      .eq('id', id)
      .single()

    if (promoError || !promoData) {
      setError('Promotion introuvable.')
      setLoading(false)
      return
    }

    setPromo(promoData)

    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('solde_disponible, solde_bloque')
      .eq('user_id', authData.user.id)
      .single()

    if (walletError) {
      console.error('Erreur wallet:', walletError)
      setWallet(null)
    } else {
      setWallet(walletData)
    }

    setLoading(false)
  }

  const handleAcheter = async () => {
    if (!user || !promo || processing) return

    setProcessing(true)
    setMessage('')
    setError('')

    try {
      if (promo.statut !== 'actif') {
        setError('Cette promotion n’est plus active.')
        return
      }

      if (Number(promo.stock) <= 0) {
        setError('Stock épuisé.')
        return
      }

      const montantTotal = Number(promo.prix_promo)

      if (!Number.isFinite(montantTotal) || montantTotal <= 0) {
        setError('Montant de la promotion invalide.')
        return
      }

      if (
        wallet &&
        Number(wallet.solde_disponible || 0) < montantTotal
      ) {
        setError(
          `Solde insuffisant. Il faut ${formatMoney(montantTotal)} FCFA disponibles dans ton portefeuille.`
        )
        return
      }

      /*
       * IMPORTANT :
       * Le montant n'est PAS envoyé au RPC.
       *
       * Le serveur récupère lui-même :
       * - le prix
       * - le vendeur
       * - le stock
       * - le wallet du client
       *
       * Cela empêche le navigateur de manipuler
       * les montants financiers.
       */
      const { data, error: rpcError } = await supabase.rpc(
        'create_direct_purchase_from_wallet',
        {
          p_promotion_id: promo.id,
        }
      )

      if (rpcError) {
        console.error('Erreur achat direct:', rpcError)
        setError(`Erreur lors de l'achat : ${rpcError.message}`)
        return
      }

      if (!data?.success) {
        setError(
          data?.message ||
          'L’achat n’a pas pu être effectué.'
        )
        return
      }

      const transactionId =
        data.transaction_id ||
        data.id ||
        data.transactionId

      setMessage('✅ Achat effectué. Les fonds sont maintenant bloqués.')

      if (transactionId) {
        router.push(`/transactions?success=${transactionId}`)
      } else {
        setTimeout(() => {
          router.push('/transactions')
        }, 800)
      }
    } catch (err) {
      console.error(err)
      setError(
        err?.message ||
        'Une erreur inattendue est survenue.'
      )
    } finally {
      setProcessing(false)
    }
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontFamily: 'sans-serif',
        }}
      >
        Chargement...
      </div>
    )
  }

  if (!promo) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '420px',
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}
          >
            ⚠️
          </div>

          <div
            style={{
              fontSize: '16px',
              fontWeight: '700',
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
            {error || 'Cette promotion n’existe plus.'}
          </div>

          <button
            onClick={() => router.back()}
            style={{
              padding: '12px 18px',
              background: '#FF5C00',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const montantTotal = Number(promo.prix_promo || 0)
  const soldeDisponible = Number(
    wallet?.solde_disponible || 0
  )

  const soldeSuffisant =
    soldeDisponible >= montantTotal

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
          background: '#0A0A0A',
          borderBottom: '1px solid #1E1E1E',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
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
            fontSize: '16px',
            fontWeight: '700',
          }}
        >
          Achat direct
        </div>
      </div>

      {/* CONTENT */}

      <div
        style={{
          padding: '80px 20px 40px',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {/* ARTICLE */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #2A2A2A',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#888',
              marginBottom: '4px',
            }}
          >
            ARTICLE
          </div>

          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
              marginBottom: '6px',
            }}
          >
            {promo.titre}
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#888',
            }}
          >
            🏪 {promo.profiles?.nom || 'Vendeur'}
            {' · '}
            {promo.profiles?.adresse ||
              'Adresse non précisée'}
          </div>

          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              color:
                Number(promo.stock) > 0
                  ? '#00C48C'
                  : '#FF3C3C',
            }}
          >
            📦 Stock : {Number(promo.stock || 0)}
          </div>
        </div>

        {/* WALLET */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '14px',
            padding: '14px',
            border: '1px solid #2A2A2A',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#888' }}>
              Solde disponible
            </span>

            <span
              style={{
                fontWeight: '800',
                color: soldeSuffisant
                  ? '#00C48C'
                  : '#FF3C3C',
              }}
            >
              {formatMoney(soldeDisponible)} FCFA
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#888' }}>
              Prix de l’article
            </span>

            <span
              style={{
                color: '#FF5C00',
                fontWeight: '800',
              }}
            >
              {formatMoney(montantTotal)} FCFA
            </span>
          </div>

          {!soldeSuffisant && (
            <button
              onClick={() => router.push('/wallet')}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                background: 'rgba(255,60,60,0.1)',
                border: '1px solid #FF3C3C',
                borderRadius: '10px',
                color: '#FF3C3C',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              💰 Approvisionner mon portefeuille
            </button>
          )}
        </div>

        {/* RÉCAPITULATIF */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '14px',
            padding: '14px',
            border: '1px solid #2A2A2A',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              fontSize: '13px',
            }}
          >
            <span style={{ color: '#888' }}>
              Prix à payer
            </span>

            <span
              style={{
                fontWeight: '800',
                color: '#FF5C00',
              }}
            >
              {formatMoney(montantTotal)} FCFA
            </span>
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#888',
              lineHeight: '1.6',
            }}
          >
            Le montant sera débité de ton portefeuille puis
            bloqué par Promo’s World. Le vendeur recevra les
            fonds après confirmation de la réception.
          </div>
        </div>

        {/* INFO */}

        <div
          style={{
            background: 'rgba(255,92,0,0.08)',
            borderRadius: '12px',
            padding: '12px 14px',
            border:
              '1px solid rgba(255,92,0,0.2)',
            fontSize: '12px',
            color: '#888',
            marginBottom: '20px',
            lineHeight: '1.6',
          }}
        >
          🔒 Paiement par portefeuille Promo’s World.
          <br />
          Les fonds restent bloqués jusqu’à la confirmation
          de la réception de l’article.
        </div>

        {/* ERREUR */}

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '16px',
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF3C3C',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* MESSAGE */}

        {message && !error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '16px',
              background: 'rgba(0,196,140,0.1)',
              border: '1px solid #00C48C',
              color: '#00C48C',
              fontSize: '13px',
            }}
          >
            {message}
          </div>
        )}

        {/* BOUTON */}

        <button
          onClick={handleAcheter}
          disabled={
            processing ||
            !soldeSuffisant ||
            promo.statut !== 'actif' ||
            Number(promo.stock) <= 0
          }
          style={{
            width: '100%',
            padding: '15px',
            background:
              processing ||
              !soldeSuffisant ||
              promo.statut !== 'actif' ||
              Number(promo.stock) <= 0
                ? '#333'
                : '#00C48C',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            cursor:
              processing ||
              !soldeSuffisant ||
              promo.statut !== 'actif' ||
              Number(promo.stock) <= 0
                ? 'not-allowed'
                : 'pointer',
          }}
        >
          {processing
            ? 'Traitement...'
            : !soldeSuffisant
              ? 'Solde insuffisant'
              : Number(promo.stock) <= 0
                ? 'Stock épuisé'
                : `Payer ${formatMoney(montantTotal)} FCFA`}
        </button>

        <button
          onClick={() => router.push('/wallet')}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '12px',
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: '12px',
            color: '#888',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          💰 Voir mon portefeuille
        </button>
      </div>
    </div>
  )
}