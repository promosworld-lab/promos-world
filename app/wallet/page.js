'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Wallet() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [showDeposit, setShowDeposit] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data, error: userError } =
      await supabase.auth.getUser()

    if (userError || !data.user) {
      router.push('/auth')
      return
    }

    setUser(data.user)

    await Promise.all([
      loadWallet(data.user.id),
      loadWalletTransactions(data.user.id),
    ])

    setLoading(false)
  }

  const loadWallet = async (userId) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Erreur wallet:', error)
      setError(
        'Impossible de récupérer ton portefeuille.'
      )
      return null
    }

    setWallet(data)
    return data
  }

  const loadWalletTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', {
        ascending: false,
      })
      .limit(20)

    if (error) {
      console.error(
        'Erreur historique portefeuille:',
        error
      )

      setError(
        'Impossible de récupérer l’activité du portefeuille.'
      )

      return []
    }

    setTransactions(data || [])
    return data || []
  }

  const refreshWallet = async () => {
    if (!user) return

    setRefreshing(true)
    setError('')

    await Promise.all([
      loadWallet(user.id),
      loadWalletTransactions(user.id),
    ])

    setRefreshing(false)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  const handleDeposit = async () => {
    setMessage('')
    setError('')

    const amount = Number(depositAmount)

    if (!amount || amount <= 0) {
      setError(
        'Entre un montant valide supérieur à 0 FCFA.'
      )
      return
    }

    if (amount > 1000000) {
      setError(
        'Le montant maximum pour ce test est de 1 000 000 FCFA.'
      )
      return
    }

    setDepositLoading(true)

    const reference = `TEST-${Date.now()}`

    const { data, error } = await supabase.rpc(
      'simulate_wallet_deposit',
      {
        p_amount: amount,
        p_reference: reference,
      }
    )

    if (error) {
      console.error(
        'Erreur dépôt:',
        error
      )

      setError(
        `Erreur lors du dépôt : ${error.message}`
      )

      setDepositLoading(false)
      return
    }

    if (!data?.success) {
      setError(
        data?.message ||
          'Le dépôt n’a pas pu être effectué.'
      )

      setDepositLoading(false)
      return
    }

    setDepositAmount('')
    setShowDeposit(false)

    setMessage(
      `Dépôt simulé avec succès : +${formatMoney(
        amount
      )} FCFA`
    )

    await refreshWallet()

    setDepositLoading(false)
  }

  const getTransactionLabel = (type) => {
    const labels = {
      depot: 'Dépôt',
      retrait: 'Retrait',
      achat: 'Achat',
      reservation: 'Réservation',
      remboursement: 'Remboursement',
      liberation_fonds:
        'Libération des fonds',
      commission: 'Commission',
      ajustement: 'Ajustement',
    }

    return labels[type] || 'Mouvement'
  }

  const isPositiveTransaction = (type) => {
    return [
      'depot',
      'remboursement',
      'liberation_fonds',
    ].includes(type)
  }

  const getTransactionColor = (type) => {
    return isPositiveTransaction(type)
      ? '#4ADE80'
      : '#FF5C00'
  }

  const getTransactionPrefix = (type) => {
    return isPositiveTransaction(type)
      ? '+'
      : '-'
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
          borderBottom:
            '1px solid #1E1E1E',
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
            fontSize: '18px',
            fontWeight: '800',
            color: '#FF5C00',
          }}
        >
          Promo's
          <span style={{ color: 'white' }}>
            World
          </span>
        </div>

        <button
          onClick={refreshWallet}
          disabled={refreshing}
          style={{
            marginLeft: 'auto',
            width: '36px',
            height: '36px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '10px',
            color: '#aaa',
            cursor: refreshing
              ? 'not-allowed'
              : 'pointer',
          }}
        >
          {refreshing ? '...' : '↻'}
        </button>
      </div>

      {/* CONTENT */}

      <div
        style={{
          padding: '80px 20px 40px',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '6px',
          }}
        >
          💰 Portefeuille
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Gère ton solde disponible et tes
          fonds bloqués.
        </div>

        {/* MESSAGES */}

        {message && (
          <div
            style={{
              background: '#102A18',
              border: '1px solid #1F6B38',
              color: '#6EE7A0',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#2A1111',
              border: '1px solid #6B2020',
              color: '#FF8A8A',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        {/* SOLDE */}

        <div
          style={{
            background:
              'linear-gradient(135deg, #FF5C00, #FF8A00)',
            borderRadius: '22px',
            padding: '24px',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              opacity: 0.85,
              marginBottom: '8px',
            }}
          >
            Solde disponible
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: '900',
              marginBottom: '10px',
            }}
          >
            {formatMoney(
              wallet?.solde_disponible
            )}{' '}
            FCFA
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.9,
            }}
          >
            Argent utilisable pour tes achats
            et réservations.
          </div>
        </div>

        {/* FONDS BLOQUES */}

        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '5px',
                }}
              >
                🔒 Fonds bloqués
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  color: '#FFB800',
                }}
              >
                {formatMoney(
                  wallet?.solde_bloque
                )}{' '}
                FCFA
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#666',
                textAlign: 'right',
                maxWidth: '180px',
              }}
            >
              Argent réservé en attente de
              finalisation.
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => {
              setShowDeposit(true)
              setMessage('')
              setError('')
            }}
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ➕ Déposer
          </button>

          <button
            onClick={() => {
              setError(
                'Les retraits seront disponibles après intégration du paiement réel.'
              )
              setMessage('')
            }}
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ↗️ Retirer
          </button>

          <button
            onClick={() =>
              router.push('/transactions')
            }
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            💳 Transactions
          </button>
        </div>

        {/* MODAL DEPOT */}

        {showDeposit && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              zIndex: 200,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#151515',
                border: '1px solid #2A2A2A',
                borderRadius: '20px',
                padding: '22px',
              }}
            >
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  marginBottom: '6px',
                }}
              >
                ➕ Déposer de l'argent
              </div>

              <div
                style={{
                  color: '#888',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                }}
              >
                Mode simulation pour les tests.
                Aucun paiement réel ne sera
                effectué.
              </div>

              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                Montant du dépôt
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#0A0A0A',
                  border:
                    '1px solid #2A2A2A',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}
              >
                <input
                  type="number"
                  min="1"
                  max="1000000"
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(
                      e.target.value
                    )
                  }
                  placeholder="Ex : 10000"
                  style={{
                    flex: 1,
                    background:
                      'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    padding: '14px',
                    fontSize: '16px',
                  }}
                />

                <div
                  style={{
                    padding: '0 14px',
                    color: '#888',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                >
                  FCFA
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <button
                  onClick={() => {
                    setShowDeposit(false)
                    setDepositAmount('')
                    setError('')
                  }}
                  disabled={depositLoading}
                  style={{
                    flex: 1,
                    padding: '13px',
                    background: '#1A1A1A',
                    border:
                      '1px solid #2A2A2A',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '700',
                    cursor:
                      depositLoading
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Annuler
                </button>

                <button
                  onClick={handleDeposit}
                  disabled={depositLoading}
                  style={{
                    flex: 1,
                    padding: '13px',
                    background: '#FF5C00',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '800',
                    cursor:
                      depositLoading
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {depositLoading
                    ? 'Traitement...'
                    : 'Simuler le dépôt'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITE RECENTE */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            border:
              '1px solid #2A2A2A',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
              }}
            >
              Activité récente
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#666',
              }}
            >
              {transactions.length} mouvement
              {transactions.length > 1
                ? 's'
                : ''}
            </div>
          </div>

          {transactions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#888',
                padding: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '30px',
                  marginBottom: '8px',
                }}
              >
                💰
              </div>

              <div
                style={{
                  fontSize: '13px',
                }}
              >
                Aucune activité pour le
                moment.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {transactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: '12px',
                    borderBottom:
                      '1px solid #252525',
                    paddingBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '700',
                      }}
                    >
                      {getTransactionLabel(
                        t.type
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#888',
                        marginTop: '3px',
                      }}
                    >
                      {t.description ||
                        'Mouvement portefeuille'}
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        color: '#666',
                        marginTop: '3px',
                      }}
                    >
                      {formatDate(
                        t.created_at
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      color:
                        getTransactionColor(
                          t.type
                        ),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getTransactionPrefix(
                      t.type
                    )}
                    {formatMoney(
                      t.montant
                    )}{' '}
                    FCFA
                  </div>
                </div>
              ))}
            </div>
          )}

          {transactions.length > 0 && (
            <button
              onClick={() =>
                router.push('/transactions')
              }
              style={{
                width: '100%',
                marginTop: '14px',
                padding: '11px',
                background:
                  'transparent',
                border:
                  '1px solid #2A2A2A',
                borderRadius: '10px',
                color: '#aaa',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Voir toutes les transactions →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}