'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function TransactionsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const successId = searchParams.get('success')

  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('toutes')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)

    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      router.push('/auth')
      return
    }

    setUser(data.user)

    await fetchTransactions(data.user.id)

    setLoading(false)
  }

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        promotions(
          id,
          titre,
          photo_url,
          media_type,
          vendeur_id
        ),
        vendeur:profiles!transactions_vendeur_id_fkey(
          nom,
          telephone
        ),
        client:profiles!transactions_client_id_fkey(
          nom,
          telephone
        )
      `)
      .or(`client_id.eq.${userId},vendeur_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur chargement transactions:', error)
      setTransactions([])
      return
    }

    setTransactions(data || [])
  }

  const refreshTransactions = async () => {
    if (!user) return

    await fetchTransactions(user.id)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statutLabel = (statut) => {
    switch (statut) {
      case 'bloque':
        return 'Fonds bloqués'

      case 'libere':
        return 'Fonds libérés'

      case 'rembourse':
        return 'Remboursé'

      case 'litige':
        return 'Litige'

      case 'annule':
        return 'Annulée'

      case 'en_attente':
        return 'En attente'

      default:
        return statut || 'Inconnu'
    }
  }

  const statutColor = (statut) => {
    switch (statut) {
      case 'libere':
        return {
          color: '#00C48C',
          background: 'rgba(0,196,140,0.12)',
          border: '#00C48C',
        }

      case 'bloque':
        return {
          color: '#FFB800',
          background: 'rgba(255,184,0,0.12)',
          border: '#FFB800',
        }

      case 'rembourse':
        return {
          color: '#AAAAAA',
          background: 'rgba(255,255,255,0.06)',
          border: '#555',
        }

      case 'litige':
        return {
          color: '#FF3C3C',
          background: 'rgba(255,60,60,0.10)',
          border: '#FF3C3C',
        }

      case 'annule':
        return {
          color: '#FF6B6B',
          background: 'rgba(255,60,60,0.08)',
          border: '#6B2020',
        }

      default:
        return {
          color: '#888',
          background: 'rgba(255,255,255,0.05)',
          border: '#333',
        }
    }
  }

  const typeLabel = (type) => {
    switch (type) {
      case 'achat_direct':
        return 'Achat direct'

      case 'reservation':
        return 'Réservation'

      default:
        return type || 'Transaction'
    }
  }

  const getRoleLabel = (transaction) => {
    if (transaction.client_id === user?.id) {
      return 'Client'
    }

    if (transaction.vendeur_id === user?.id) {
      return 'Vendeur'
    }

    return ''
  }

  const getOtherPerson = (transaction) => {
    if (transaction.client_id === user?.id) {
      return transaction.vendeur?.nom || 'Vendeur inconnu'
    }

    if (transaction.vendeur_id === user?.id) {
      return transaction.client?.nom || 'Client inconnu'
    }

    return '-'
  }

  const isClient = (transaction) => {
    return transaction.client_id === user?.id
  }

  const isVendeur = (transaction) => {
    return transaction.vendeur_id === user?.id
  }

  const transactionsFiltrees = transactions.filter((transaction) => {
    if (onglet === 'toutes') return true

    if (onglet === 'bloquees') {
      return transaction.statut === 'bloque'
    }

    if (onglet === 'liberees') {
      return transaction.statut === 'libere'
    }

    if (onglet === 'remboursees') {
      return transaction.statut === 'rembourse'
    }

    if (onglet === 'litiges') {
      return transaction.statut === 'litige'
    }

    return true
  })

  const onglets = [
    {
      key: 'toutes',
      label: 'Toutes',
      count: transactions.length,
    },
    {
      key: 'bloquees',
      label: '🔒 Bloquées',
      count: transactions.filter(
        (t) => t.statut === 'bloque'
      ).length,
    },
    {
      key: 'liberees',
      label: '✅ Libérées',
      count: transactions.filter(
        (t) => t.statut === 'libere'
      ).length,
    },
    {
      key: 'remboursees',
      label: '↩️ Remboursées',
      count: transactions.filter(
        (t) => t.statut === 'rembourse'
      ).length,
    },
    {
      key: 'litiges',
      label: '⚠️ Litiges',
      count: transactions.filter(
        (t) => t.statut === 'litige'
      ).length,
    },
  ]

  const totalBloque = transactions
    .filter((t) => t.statut === 'bloque')
    .reduce((total, t) => {
      if (isClient(t)) {
        return total + Number(t.montant_paye || 0)
      }

      return total
    }, 0)

  const totalLibere = transactions
    .filter((t) => t.statut === 'libere')
    .reduce((total, t) => {
      return total + Number(t.montant_paye || 0)
    }, 0)

  const totalRembourse = transactions
    .filter((t) => t.statut === 'rembourse')
    .reduce((total, t) => {
      return total + Number(t.montant_paye || 0)
    }, 0)

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
          borderBottom: '1px solid #1E1E1E',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => router.push('/')}
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
          💳 Transactions
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Suivi des mouvements liés à tes
          achats et réservations.
        </div>

        {/* MESSAGE SUCCESS */}

        {successId && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              marginBottom: '20px',
              background: 'rgba(0,196,140,0.1)',
              border: '1px solid #00C48C',
              color: '#00C48C',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          >
            ✅ Transaction créée avec succès.
            <br />
            Les fonds restent bloqués jusqu'à la
            finalisation de la réservation.
          </div>
        )}

        {/* RESUME */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              padding: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              🔒 Bloqués
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#FFB800',
              }}
            >
              {formatMoney(totalBloque)}
            </div>

            <div
              style={{
                fontSize: '10px',
                color: '#666',
                marginTop: '2px',
              }}
            >
              FCFA
            </div>
          </div>

          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              padding: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              ✅ Libérés
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#00C48C',
              }}
            >
              {formatMoney(totalLibere)}
            </div>

            <div
              style={{
                fontSize: '10px',
                color: '#666',
                marginTop: '2px',
              }}
            >
              FCFA
            </div>
          </div>

          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '14px',
              padding: '14px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              ↩️ Remboursés
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#AAA',
              }}
            >
              {formatMoney(totalRembourse)}
            </div>

            <div
              style={{
                fontSize: '10px',
                color: '#666',
                marginTop: '2px',
              }}
            >
              FCFA
            </div>
          </div>
        </div>

        {/* ONGLETS */}

        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {onglets.map((ongletItem) => (
            <button
              key={ongletItem.key}
              onClick={() =>
                setOnglet(ongletItem.key)
              }
              style={{
                flexShrink: 0,
                padding: '8px 12px',
                borderRadius: '10px',
                border:
                  onglet === ongletItem.key
                    ? '1px solid #FF5C00'
                    : '1px solid #2A2A2A',
                background:
                  onglet === ongletItem.key
                    ? 'rgba(255,92,0,0.1)'
                    : '#1A1A1A',
                color:
                  onglet === ongletItem.key
                    ? '#FF5C00'
                    : '#888',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {ongletItem.label}

              <span
                style={{
                  marginLeft: '5px',
                  background: '#2A2A2A',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  fontSize: '10px',
                }}
              >
                {ongletItem.count}
              </span>
            </button>
          ))}
        </div>

        {/* TRANSACTIONS */}

        {transactionsFiltrees.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#888',
              padding: '60px 20px',
              background: '#1A1A1A',
              borderRadius: '16px',
              border: '1px solid #2A2A2A',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px',
              }}
            >
              💳
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Aucune transaction
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '6px',
              }}
            >
              Tes transactions apparaîtront
              ici.
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
            {transactionsFiltrees.map((transaction) => {
              const client =
                isClient(transaction)

              const vendeur =
                isVendeur(transaction)

              const statusStyle =
                statutColor(
                  transaction.statut
                )

              const promotion =
                transaction.promotions

              const isVideo =
                promotion?.media_type ===
                  'video' ||
                promotion?.photo_url?.includes(
                  '.mp4'
                )

              return (
                <div
                  key={transaction.id}
                  style={{
                    background: '#1A1A1A',
                    borderRadius: '16px',
                    border:
                      '1px solid #2A2A2A',
                    overflow: 'hidden',
                  }}
                >
                  {/* HEADER TRANSACTION */}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderBottom:
                        '1px solid #222',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        background: '#252525',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                      }}
                    >
                      {promotion?.photo_url ? (
                        isVideo ? (
                          <video
                            src={
                              promotion.photo_url
                            }
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit:
                                'cover',
                            }}
                          />
                        ) : (
                          <img
                            src={
                              promotion.photo_url
                            }
                            alt={
                              promotion.titre ||
                              'Promotion'
                            }
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit:
                                'cover',
                            }}
                          />
                        )
                      ) : (
                        <span
                          style={{
                            fontSize: '22px',
                          }}
                        >
                          🏷️
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          marginBottom: '4px',
                          overflow:
                            'hidden',
                          textOverflow:
                            'ellipsis',
                          whiteSpace:
                            'nowrap',
                        }}
                      >
                        {promotion?.titre ||
                          'Transaction'}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#888',
                        }}
                      >
                        {getRoleLabel(
                          transaction
                        )}{' '}
                        ·{' '}
                        {getOtherPerson(
                          transaction
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '5px 8px',
                        borderRadius: '8px',
                        background:
                          statusStyle.background,
                        border: `1px solid ${statusStyle.border}`,
                        color:
                          statusStyle.color,
                        fontSize: '10px',
                        fontWeight: '700',
                        flexShrink: 0,
                        textAlign: 'center',
                      }}
                    >
                      {statutLabel(
                        transaction.statut
                      )}
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div
                    style={{
                      padding: '14px 16px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: '#888',
                        }}
                      >
                        Type
                      </span>

                      <span
                        style={{
                          fontWeight: '600',
                        }}
                      >
                        {typeLabel(
                          transaction.type
                        )}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: '#888',
                        }}
                      >
                        Montant
                      </span>

                      <span
                        style={{
                          color: '#FF5C00',
                          fontWeight: '800',
                        }}
                      >
                        {formatMoney(
                          transaction.montant_paye
                        )}{' '}
                        FCFA
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: '#888',
                        }}
                      >
                        Commission
                      </span>

                      <span>
                        {formatMoney(
                          transaction.commission_plateforme
                        )}{' '}
                        FCFA
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '13px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: '#888',
                        }}
                      >
                        Ton rôle
                      </span>

                      <span>
                        {client
                          ? 'Client'
                          : vendeur
                            ? 'Vendeur'
                            : '-'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        fontSize: '12px',
                      }}
                    >
                      <span
                        style={{
                          color: '#888',
                        }}
                      >
                        Date
                      </span>

                      <span
                        style={{
                          color: '#AAA',
                        }}
                      >
                        {formatDateTime(
                          transaction.created_at
                        )}
                      </span>
                    </div>
                  </div>

                  {/* EXPLICATION FONDS BLOQUÉS */}

                  {transaction.statut ===
                    'bloque' && (
                    <div
                      style={{
                        margin: '0 16px 12px',
                        padding: '11px 12px',
                        background:
                          'rgba(255,184,0,0.07)',
                        border:
                          '1px solid rgba(255,184,0,0.2)',
                        borderRadius: '10px',
                        color: '#999',
                        fontSize: '11px',
                        lineHeight: '1.5',
                      }}
                    >
                      🔒 Les fonds sont
                      actuellement bloqués.
                      Ils seront libérés lorsque
                      les conditions de
                      finalisation de la
                      réservation seront remplies.
                    </div>
                  )}

                  {/* FONDS LIBÉRÉS */}

                  {transaction.statut ===
                    'libere' && (
                    <div
                      style={{
                        margin: '0 16px 12px',
                        padding: '11px 12px',
                        background:
                          'rgba(0,196,140,0.07)',
                        border:
                          '1px solid rgba(0,196,140,0.2)',
                        borderRadius: '10px',
                        color: '#00C48C',
                        fontSize: '11px',
                        lineHeight: '1.5',
                      }}
                    >
                      ✅ Transaction
                      finalisée. Les fonds ont
                      été libérés.
                    </div>
                  )}

                  {/* REMBOURSEMENT */}

                  {transaction.statut ===
                    'rembourse' && (
                    <div
                      style={{
                        margin: '0 16px 12px',
                        padding: '11px 12px',
                        background:
                          'rgba(255,255,255,0.04)',
                        border:
                          '1px solid #333',
                        borderRadius: '10px',
                        color: '#AAA',
                        fontSize: '11px',
                        lineHeight: '1.5',
                      }}
                    >
                      ↩️ Cette transaction a
                      été remboursée.
                    </div>
                  )}

                  {/* LITIGE */}

                  {transaction.statut ===
                    'litige' && (
                    <div
                      style={{
                        margin: '0 16px 12px',
                        padding: '11px 12px',
                        background:
                          'rgba(255,60,60,0.07)',
                        border:
                          '1px solid rgba(255,60,60,0.2)',
                        borderRadius: '10px',
                        color: '#FF8A8A',
                        fontSize: '11px',
                        lineHeight: '1.5',
                      }}
                    >
                      ⚠️ Cette transaction
                      fait actuellement l'objet
                      d'un litige.
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div
                    style={{
                      padding:
                        '0 16px 14px',
                      display: 'flex',
                      gap: '8px',
                    }}
                  >
                    {transaction.reservation_id && (
                      <button
                        onClick={() =>
                          router.push(
                            '/reservations'
                          )
                        }
                        style={{
                          flex: 1,
                          padding: '10px',
                          background:
                            '#252525',
                          border:
                            '1px solid #333',
                          borderRadius:
                            '10px',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        📦 Voir la réservation
                      </button>
                    )}

                    {client &&
                      transaction.statut ===
                        'bloque' && (
                        <button
                          onClick={() =>
                            router.push(
                              `/litiges?transaction=${transaction.id}`
                            )
                          }
                          style={{
                            flex: 1,
                            padding: '10px',
                            background:
                              'transparent',
                            border:
                              '1px solid #FF3C3C',
                            borderRadius:
                              '10px',
                            color: '#FF3C3C',
                            fontSize: '11px',
                            fontWeight:
                              '700',
                            cursor:
                              'pointer',
                          }}
                        >
                          ⚠️ Signaler
                        </button>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* RAFRAÎCHIR */}

        <button
          onClick={refreshTransactions}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '12px',
            background: 'transparent',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            color: '#888',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🔄 Actualiser les transactions
        </button>
      </div>
    </div>
  )
}

export default function Transactions() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <TransactionsContent />
    </Suspense>
  )
}