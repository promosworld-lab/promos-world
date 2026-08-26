'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function Acheter() {
  const router = useRouter()
  const { id } = useParams()
  const { language, setLanguage, t, ready } = useLanguage()

  const [promo, setPromo] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [user, setUser] = useState(null)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      initPage()
    }
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

    const { data: promoData, error: promoError } =
      await supabase
        .from('promotions')
        .select(`
          *,
          profiles(nom, adresse)
        `)
        .eq('id', id)
        .single()

    if (promoError || !promoData) {
      setError(
        language === 'fr'
          ? 'Promotion introuvable.'
          : 'Promotion not found.'
      )
      setLoading(false)
      return
    }

    setPromo(promoData)

    const { data: walletData, error: walletError } =
      await supabase
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
        setError(
          language === 'fr'
            ? 'Cette promotion n’est plus active.'
            : 'This promotion is no longer active.'
        )
        return
      }

      if (Number(promo.stock) <= 0) {
        setError(
          language === 'fr'
            ? 'Stock épuisé.'
            : 'Out of stock.'
        )
        return
      }

      const montantTotal = Number(promo.prix_promo)

      if (
        !Number.isFinite(montantTotal) ||
        montantTotal <= 0
      ) {
        setError(
          language === 'fr'
            ? 'Montant de la promotion invalide.'
            : 'Invalid promotion amount.'
        )
        return
      }

      if (
        wallet &&
        Number(wallet.solde_disponible || 0) <
          montantTotal
      ) {
        setError(
          language === 'fr'
            ? `Solde insuffisant. Il faut ${formatMoney(
                montantTotal
              )} FCFA disponibles dans ton portefeuille.`
            : `Insufficient balance. You need ${formatMoney(
                montantTotal
              )} FCFA available in your wallet.`
        )
        return
      }

      const { data, error: rpcError } =
        await supabase.rpc(
          'create_direct_purchase_from_wallet',
          {
            p_promotion_id: promo.id,
          }
        )

      if (rpcError) {
        console.error(
          'Erreur achat direct:',
          rpcError
        )

        setError(
          language === 'fr'
            ? `Erreur lors de l'achat : ${rpcError.message}`
            : `Purchase error: ${rpcError.message}`
        )

        return
      }

      if (!data?.success) {
        setError(
          data?.message ||
            (language === 'fr'
              ? "L’achat n’a pas pu être effectué."
              : 'The purchase could not be completed.')
        )
        return
      }

      const transactionId =
        data.transaction_id ||
        data.id ||
        data.transactionId

      setMessage(
        language === 'fr'
          ? '✅ Achat effectué. Les fonds sont maintenant bloqués.'
          : '✅ Purchase completed. The funds are now held securely.'
      )

      if (transactionId) {
        router.push(
          `/transactions?success=${transactionId}`
        )
      } else {
        setTimeout(() => {
          router.push('/transactions')
        }, 800)
      }
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
          (language === 'fr'
            ? 'Une erreur inattendue est survenue.'
            : 'An unexpected error occurred.')
      )
    } finally {
      setProcessing(false)
    }
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      language === 'fr' ? 'fr-FR' : 'en-US'
    )
  }

  if (!ready || loading) {
    return (
      <div className="loading-page">
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #888;
            font-family: sans-serif;
          }
        `}</style>

        {language === 'fr'
          ? 'Chargement...'
          : 'Loading...'}
      </div>
    )
  }

  if (!promo) {
    return (
      <div className="error-page">
        <style jsx>{`
          .error-page {
            min-height: 100vh;
            background: #0a0a0a;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            font-family: sans-serif;
            box-sizing: border-box;
          }

          .error-box {
            text-align: center;
            width: 100%;
            max-width: 420px;
          }

          .error-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .error-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .error-message {
            color: #888;
            font-size: 13px;
            margin-bottom: 20px;
          }

          button {
            padding: 12px 18px;
            background: #ff5c00;
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 700;
            cursor: pointer;
          }
        `}</style>

        <div className="error-box">
          <div className="error-icon">⚠️</div>

          <div className="error-title">
            {language === 'fr'
              ? 'Promotion introuvable'
              : 'Promotion not found'}
          </div>

          <div className="error-message">
            {error ||
              (language === 'fr'
                ? 'Cette promotion n’existe plus.'
                : 'This promotion no longer exists.')}
          </div>

          <button onClick={() => router.back()}>
            {language === 'fr'
              ? 'Retour'
              : 'Go back'}
          </button>
        </div>
      </div>
    )
  }

  const montantTotal = Number(
    promo.prix_promo || 0
  )

  const soldeDisponible = Number(
    wallet?.solde_disponible || 0
  )

  const soldeSuffisant =
    soldeDisponible >= montantTotal

  const canBuy =
    !processing &&
    soldeSuffisant &&
    promo.statut === 'actif' &&
    Number(promo.stock) > 0

  return (
    <div className="buy-page">
      <style jsx>{`
        .buy-page {
          min-height: 100vh;
          background: #0a0a0a;
          color: white;
          font-family: sans-serif;
          overflow-x: hidden;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 10, 10, 0.97);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1e1e1e;
        }

        .header-inner {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          min-height: 64px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
        }

        .back-button {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }

        .header-title {
          flex: 1;
          min-width: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .language-button {
          padding: 8px 10px;
          background: #151515;
          border: 1px solid #2a2a2a;
          border-radius: 9px;
          color: white;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .content {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 24px 16px 50px;
          box-sizing: border-box;
        }

        .card {
          background: #151515;
          border: 1px solid #252525;
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 14px;
          box-sizing: border-box;
        }

        .article-title {
          font-size: 11px;
          color: #888;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .promo-title {
          font-size: 19px;
          font-weight: 800;
          line-height: 1.3;
          margin-bottom: 8px;
          word-break: break-word;
        }

        .seller {
          font-size: 12px;
          color: #888;
          line-height: 1.6;
        }

        .stock {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .wallet-row,
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          font-size: 13px;
        }

        .wallet-row + .wallet-row {
          margin-top: 10px;
        }

        .muted {
          color: #888;
        }

        .wallet-balance {
          font-weight: 800;
          text-align: right;
        }

        .orange {
          color: #ff5c00;
          font-weight: 800;
        }

        .recap-title {
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .info {
          background: rgba(255, 92, 0, 0.08);
          border: 1px solid rgba(255, 92, 0, 0.2);
          border-radius: 12px;
          padding: 13px 14px;
          color: #999;
          font-size: 12px;
          line-height: 1.7;
          margin-bottom: 14px;
        }

        .warning-button {
          width: 100%;
          margin-top: 13px;
          padding: 11px;
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid #ff3c3c;
          border-radius: 10px;
          color: #ff3c3c;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .message {
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          background: rgba(0, 196, 140, 0.1);
          border: 1px solid #00c48c;
          color: #00c48c;
          font-size: 13px;
          line-height: 1.5;
        }

        .error {
          padding: 12px;
          border-radius: 10px;
          margin-bottom: 14px;
          background: rgba(255, 60, 60, 0.1);
          border: 1px solid #ff3c3c;
          color: #ff3c3c;
          font-size: 13px;
          line-height: 1.5;
        }

        .buy-button {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 14px;
          color: white;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
        }

        .wallet-button {
          width: 100%;
          margin-top: 10px;
          padding: 12px;
          background: transparent;
          border: 1px solid #333;
          border-radius: 12px;
          color: #888;
          font-size: 12px;
          cursor: pointer;
        }

        @media (min-width: 700px) {
          .content {
            padding-top: 35px;
          }

          .card {
            padding: 22px;
          }
        }

        @media (max-width: 480px) {
          .header-inner {
            padding: 9px 12px;
          }

          .header-title {
            font-size: 14px;
          }

          .language-button {
            font-size: 10px;
            padding: 8px;
          }

          .content {
            padding: 18px 12px 35px;
          }

          .card {
            padding: 15px;
            border-radius: 15px;
          }

          .promo-title {
            font-size: 17px;
          }

          .wallet-row,
          .price-row {
            align-items: flex-start;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <button
            className="back-button"
            onClick={() => router.back()}
            aria-label={
              language === 'fr'
                ? 'Retour'
                : 'Back'
            }
          >
            ←
          </button>

          <div className="header-title">
            {language === 'fr'
              ? 'Achat direct'
              : 'Direct purchase'}
          </div>

          <button
            className="language-button"
            onClick={() =>
              setLanguage(
                language === 'fr' ? 'en' : 'fr'
              )
            }
          >
            {language === 'fr'
              ? '🇬🇧 EN'
              : '🇫🇷 FR'}
          </button>
        </div>
      </header>

      <main className="content">
        {/* ARTICLE */}
        <section className="card">
          <div className="article-title">
            {language === 'fr'
              ? 'Article'
              : 'Item'}
          </div>

          <div className="promo-title">
            {promo.titre}
          </div>

          <div className="seller">
            🏪 {promo.profiles?.nom || (
              language === 'fr'
                ? 'Vendeur'
                : 'Seller'
            )}

            {' · '}

            {promo.profiles?.adresse ||
              (language === 'fr'
                ? 'Adresse non précisée'
                : 'Address not specified')}
          </div>

          <div
            className="stock"
            style={{
              color:
                Number(promo.stock) > 0
                  ? '#00C48C'
                  : '#FF3C3C',
            }}
          >
            📦{' '}
            {language === 'fr'
              ? `Stock : ${Number(promo.stock || 0)}`
              : `Stock: ${Number(promo.stock || 0)}`}
          </div>
        </section>

        {/* WALLET */}
        <section className="card">
          <div className="wallet-row">
            <span className="muted">
              {language === 'fr'
                ? 'Solde disponible'
                : 'Available balance'}
            </span>

            <span
              className="wallet-balance"
              style={{
                color: soldeSuffisant
                  ? '#00C48C'
                  : '#FF3C3C',
              }}
            >
              {formatMoney(soldeDisponible)} FCFA
            </span>
          </div>

          <div className="wallet-row">
            <span className="muted">
              {language === 'fr'
                ? 'Prix de l’article'
                : 'Item price'}
            </span>

            <span className="orange">
              {formatMoney(montantTotal)} FCFA
            </span>
          </div>

          {!soldeSuffisant && (
            <button
              className="warning-button"
              onClick={() => router.push('/wallet')}
            >
              💰{' '}
              {language === 'fr'
                ? 'Approvisionner mon portefeuille'
                : 'Add funds to my wallet'}
            </button>
          )}
        </section>

        {/* RECAP */}
        <section className="card">
          <div className="recap-title">
            {language === 'fr'
              ? 'Récapitulatif'
              : 'Summary'}
          </div>

          <div className="price-row">
            <span className="muted">
              {language === 'fr'
                ? 'Prix à payer'
                : 'Amount to pay'}
            </span>

            <span className="orange">
              {formatMoney(montantTotal)} FCFA
            </span>
          </div>

          <div
            style={{
              marginTop: '15px',
              color: '#888',
              fontSize: '12px',
              lineHeight: 1.7,
            }}
          >
            {language === 'fr'
              ? 'Le montant sera débité de ton portefeuille puis bloqué par Promo’s World. Le vendeur recevra les fonds après les validations prévues par le système.'
              : "The amount will be deducted from your wallet and held securely by Promo's World. The seller will receive the funds after the required validations."}
          </div>
        </section>

        {/* SECURITY */}
        <div className="info">
          🔒{' '}
          {language === 'fr'
            ? 'Paiement sécurisé par le portefeuille Promo’s World.'
            : "Secure payment through the Promo's World wallet."}
          <br />
          {language === 'fr'
            ? 'Les fonds restent bloqués conformément au processus de transaction.'
            : 'Funds remain held according to the transaction process.'}
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="message">
            {message}
          </div>
        )}

        {/* PAYMENT */}
        <button
          onClick={handleAcheter}
          disabled={!canBuy}
          className="buy-button"
          style={{
            background: canBuy
              ? '#00C48C'
              : '#333',
            cursor: canBuy
              ? 'pointer'
              : 'not-allowed',
          }}
        >
          {processing
            ? language === 'fr'
              ? 'Traitement...'
              : 'Processing...'
            : !soldeSuffisant
              ? language === 'fr'
                ? 'Solde insuffisant'
                : 'Insufficient balance'
              : Number(promo.stock) <= 0
                ? language === 'fr'
                  ? 'Stock épuisé'
                  : 'Out of stock'
                : language === 'fr'
                  ? `Payer ${formatMoney(
                      montantTotal
                    )} FCFA`
                  : `Pay ${formatMoney(
                      montantTotal
                    )} FCFA`}
        </button>

        <button
          onClick={() => router.push('/wallet')}
          className="wallet-button"
        >
          💰{' '}
          {language === 'fr'
            ? 'Voir mon portefeuille'
            : 'View my wallet'}
        </button>
      </main>
    </div>
  )
}