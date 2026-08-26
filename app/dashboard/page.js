'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [reservations, setReservations] = useState([])
  const [transactions, setTransactions] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initDashboard()
  }, [])

  const initDashboard = async () => {
    setLoading(true)

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData?.user) {
      router.push('/auth')
      return
    }

    const currentUser = authData.user
    setUser(currentUser)

    await Promise.all([
      loadProfile(currentUser.id),
      loadWallet(currentUser.id),
      loadPromotions(currentUser.id),
      loadReservations(currentUser.id),
      loadTransactions(currentUser.id),
    ])

    setLoading(false)
  }

  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error) {
      setProfile(data)
    }
  }

  const loadWallet = async (userId) => {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!error) {
      setWallet(data)
    }
  }

  const loadPromotions = async (userId) => {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('vendeur_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error) {
      setPromotions(data || [])
    }
  }

  const loadReservations = async (userId) => {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        promotions(
          titre,
          prix_promo,
          photo_url
        )
      `)
      .or(`client_id.eq.${userId},vendeur_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error) {
      setReservations(data || [])
    }
  }

  const loadTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        promotions(titre)
      `)
      .or(`client_id.eq.${userId},vendeur_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!error) {
      setTransactions(data || [])
    }
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const formatDate = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getReservationStatus = (status) => {
    const labels = {
      en_attente: 'En attente',
      acceptee: 'Acceptée',
      refusee: 'Refusée',
      rejetee: 'Rejetée',
      acompte_paye: 'Acompte payé',
      solde_paye: 'Solde payé',
      expediee: 'Expédiée',
      livree: 'Livrée',
      recue: 'Reçue',
      terminee: 'Terminée',
      annulee: 'Annulée',
      expiree: 'Expirée',
      litige: 'Litige',
    }

    return labels[status] || status || '-'
  }

  const getReservationColor = (status) => {
    if (
      status === 'terminee' ||
      status === 'recue' ||
      status === 'livree'
    ) {
      return '#00C48C'
    }

    if (
      status === 'en_attente' ||
      status === 'acceptee' ||
      status === 'acompte_paye' ||
      status === 'solde_paye'
    ) {
      return '#FFB800'
    }

    if (
      status === 'litige' ||
      status === 'refusee' ||
      status === 'rejetee'
    ) {
      return '#FF3C3C'
    }

    return '#888'
  }

  const getTransactionColor = (status) => {
    if (status === 'libere') return '#00C48C'
    if (status === 'bloque') return '#FFB800'
    if (status === 'rembourse') return '#888'
    if (status === 'litige') return '#FF3C3C'

    return '#888'
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
        Chargement du tableau de bord...
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
          borderBottom: '1px solid #1E1E1E',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 100,
        }}
      >
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

        <button
          onClick={() => router.push('/profil')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          👤
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: '85px 20px 50px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* BIENVENUE */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '13px',
              color: '#888',
              marginBottom: '5px',
            }}
          >
            Tableau de bord
          </div>

          <div
            style={{
              fontSize: '24px',
              fontWeight: '900',
            }}
          >
            Bonjour {profile?.nom || user?.email || '👋'}
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#777',
              marginTop: '5px',
            }}
          >
            Gérez vos achats, réservations et activités.
          </div>
        </div>

        {/* WALLET */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #FF5C00, #FF8500)',
            borderRadius: '20px',
            padding: '22px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              opacity: 0.85,
              marginBottom: '8px',
            }}
          >
            Solde disponible
          </div>

          <div
            style={{
              fontSize: '30px',
              fontWeight: '900',
              marginBottom: '5px',
            }}
          >
            {formatMoney(wallet?.solde_disponible)} FCFA
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.85,
            }}
          >
            Fonds bloqués :{' '}
            {formatMoney(wallet?.solde_bloque)} FCFA
          </div>

          <button
            onClick={() => router.push('/wallet')}
            style={{
              marginTop: '16px',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            Gérer mon portefeuille
          </button>
        </div>

        {/* RACCOURCIS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => router.push('/reservations')}
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            📌 Mes réservations
          </button>

          <button
            onClick={() => router.push('/transactions')}
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            💳 Transactions
          </button>

          <button
            onClick={() => router.push('/litiges')}
            style={{
              padding: '14px',
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              color: 'white',
              fontWeight: '800',
              cursor: 'pointer',
            }}
          >
            ⚠️ Litiges
          </button>

          {profile?.role === 'vendeur' && (
            <button
              onClick={() => router.push('/promo')}
              style={{
                padding: '14px',
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              🏪 Mes promotions
            </button>
          )}
        </div>

        {/* RÉSERVATIONS */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
              }}
            >
              📌 Réservations récentes
            </div>

            <button
              onClick={() => router.push('/reservations')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF5C00',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Voir tout →
            </button>
          </div>

          {reservations.length === 0 ? (
            <div
              style={{
                padding: '25px',
                textAlign: 'center',
                color: '#777',
                fontSize: '13px',
              }}
            >
              Aucune réservation récente.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {reservations.map((reservation) => {
                const isClient =
                  reservation.client_id === user?.id

                return (
                  <div
                    key={reservation.id}
                    style={{
                      background: '#111',
                      border: '1px solid #252525',
                      borderRadius: '12px',
                      padding: '13px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            marginBottom: '4px',
                          }}
                        >
                          {reservation.promotions?.titre ||
                            'Réservation'}
                        </div>

                        <div
                          style={{
                            fontSize: '11px',
                            color: '#777',
                          }}
                        >
                          {isClient
                            ? 'Achat client'
                            : 'Réservation vendeur'}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          color: getReservationColor(
                            reservation.statut
                          ),
                        }}
                      >
                        {getReservationStatus(
                          reservation.statut
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: '#777' }}>
                        Acompte
                      </span>

                      <span style={{ fontWeight: '800' }}>
                        {formatMoney(
                          reservation.montant_acompte
                        )}{' '}
                        FCFA
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* TRANSACTIONS */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                fontWeight: '900',
              }}
            >
              💳 Transactions récentes
            </div>

            <button
              onClick={() => router.push('/transactions')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FF5C00',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Voir tout →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div
              style={{
                padding: '25px',
                textAlign: 'center',
                color: '#777',
                fontSize: '13px',
              }}
            >
              Aucune transaction récente.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    background: '#111',
                    border: '1px solid #252525',
                    borderRadius: '12px',
                    padding: '13px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '800',
                      }}
                    >
                      {transaction.promotions?.titre ||
                        'Transaction'}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#777',
                        marginTop: '4px',
                      }}
                    >
                      {transaction.type === 'achat_direct'
                        ? 'Achat direct'
                        : 'Réservation'}
                      {' · '}
                      {formatDate(transaction.created_at)}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '900',
                      }}
                    >
                      {formatMoney(
                        transaction.montant_paye
                      )}{' '}
                      FCFA
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        color: getTransactionColor(
                          transaction.statut
                        ),
                        fontWeight: '800',
                        marginTop: '3px',
                      }}
                    >
                      {transaction.statut}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROMOTIONS VENDEUR */}
        {profile?.role === 'vendeur' && (
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '18px',
              padding: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '900',
                }}
              >
                🏪 Mes promotions
              </div>

              <button
                onClick={() => router.push('/promo')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FF5C00',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                Voir tout →
              </button>
            </div>

            {promotions.length === 0 ? (
              <div
                style={{
                  padding: '25px',
                  textAlign: 'center',
                  color: '#777',
                  fontSize: '13px',
                }}
              >
                Aucune promotion publiée.
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {promotions.map((promotion) => (
                  <div
                    key={promotion.id}
                    style={{
                      background: '#111',
                      border: '1px solid #252525',
                      borderRadius: '12px',
                      padding: '13px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '800',
                        }}
                      >
                        {promotion.titre}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#777',
                          marginTop: '4px',
                        }}
                      >
                        {formatMoney(
                          promotion.prix_promo
                        )}{' '}
                        FCFA · Stock :{' '}
                        {promotion.stock ?? 0}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        color:
                          promotion.statut === 'actif'
                            ? '#00C48C'
                            : '#888',
                        fontWeight: '800',
                      }}
                    >
                      {promotion.statut}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}