'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminTransactions() {
  const router = useRouter()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [filtre, setFiltre] = useState('toutes')

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      router.push('/')
      return
    }

    await fetchTransactions()

    setLoading(false)
  }

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        promotions(
          titre,
          photo_url,
          media_type
        ),
        client:profiles!transactions_client_id_fkey(
          nom,
          telephone
        ),
        vendeur:profiles!transactions_vendeur_id_fkey(
          nom,
          telephone
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur transactions admin:', error)
      setMessage('Erreur lors du chargement des transactions.')
      setTransactions([])
      return
    }

    setTransactions(data || [])
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statutLabel = (statut) => {
    if (statut === 'bloque') return 'Fonds bloqués'
    if (statut === 'libere') return 'Fonds libérés'
    if (statut === 'rembourse') return 'Remboursé'
    if (statut === 'litige') return 'Litige'

    return statut || 'Inconnu'
  }

  const statutColor = (statut) => {
    if (statut === 'libere') {
      return {
        bg: 'rgba(0,196,140,0.12)',
        color: '#00C48C',
        border: '#00C48C',
      }
    }

    if (statut === 'bloque') {
      return {
        bg: 'rgba(255,184,0,0.12)',
        color: '#FFB800',
        border: '#FFB800',
      }
    }

    if (statut === 'rembourse') {
      return {
        bg: 'rgba(150,150,150,0.12)',
        color: '#AAA',
        border: '#666',
      }
    }

    if (statut === 'litige') {
      return {
        bg: 'rgba(255,60,60,0.12)',
        color: '#FF3C3C',
        border: '#FF3C3C',
      }
    }

    return {
      bg: 'rgba(255,255,255,0.05)',
      color: '#888',
      border: '#333',
    }
  }

  const typeLabel = (type) => {
    if (type === 'achat_direct') return 'Achat direct'
    if (type === 'reservation') return 'Réservation'

    return type || '-'
  }

  const transactionsFiltrees = transactions.filter((transaction) => {
    if (filtre === 'toutes') return true

    return transaction.statut === filtre
  })

  const totalBloque = transactions
    .filter(t => t.statut === 'bloque')
    .reduce((total, t) => total + Number(t.montant_paye || 0), 0)

  const totalLibere = transactions
    .filter(t => t.statut === 'libere')
    .reduce((total, t) => total + Number(t.montant_paye || 0), 0)

  const totalRembourse = transactions
    .filter(t => t.statut === 'rembourse')
    .reduce((total, t) => total + Number(t.montant_paye || 0), 0)

  const totalCommissions = transactions
    .reduce((total, t) => total + Number(t.commission_plateforme || 0), 0)

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
          onClick={() => router.push('/admin')}
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
          padding: '80px 20px 40px',
          maxWidth: '1000px',
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
          💳 Transactions admin
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Vue globale des paiements, fonds bloqués, remboursements et commissions.
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF3C3C',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '13px',
            }}
          >
            {message}
          </div>
        )}

        {/* STATISTIQUES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
              🔒 Fonds bloqués
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#FFB800',
              }}
            >
              {formatMoney(totalBloque)} FCFA
            </div>
          </div>

          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
              💰 Fonds libérés
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#00C48C',
              }}
            >
              {formatMoney(totalLibere)} FCFA
            </div>
          </div>

          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
              ↩️ Remboursé
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#AAA',
              }}
            >
              {formatMoney(totalRembourse)} FCFA
            </div>
          </div>

          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
              🧾 Commissions
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#FF5C00',
              }}
            >
              {formatMoney(totalCommissions)} FCFA
            </div>
          </div>
        </div>

        {/* FILTRES */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          {[
            { key: 'toutes', label: 'Toutes' },
            { key: 'bloque', label: '🔒 Bloquées' },
            { key: 'libere', label: '✅ Libérées' },
            { key: 'rembourse', label: '↩️ Remboursées' },
            { key: 'litige', label: '⚠️ Litiges' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFiltre(item.key)}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border:
                  filtre === item.key
                    ? '1px solid #FF5C00'
                    : '1px solid #2A2A2A',
                background:
                  filtre === item.key
                    ? 'rgba(255,92,0,0.1)'
                    : '#1A1A1A',
                color:
                  filtre === item.key
                    ? '#FF5C00'
                    : '#888',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {item.label}

              <span
                style={{
                  marginLeft: '6px',
                  background: '#2A2A2A',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                }}
              >
                {
                  item.key === 'toutes'
                    ? transactions.length
                    : transactions.filter(t => t.statut === item.key).length
                }
              </span>
            </button>
          ))}
        </div>

        {/* LISTE */}
        {transactionsFiltrees.length === 0 ? (
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '50px 20px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>
              💳
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              Aucune transaction dans cette catégorie.
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
            {transactionsFiltrees.map((t) => {
              const status = statutColor(t.statut)

              return (
                <div
                  key={t.id}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '16px',
                    padding: '16px',
                  }}
                >
                  {/* TITRE */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '800',
                          marginBottom: '4px',
                        }}
                      >
                        {t.promotions?.titre || 'Transaction'}
                      </div>

                      <div
                        style={{
                          fontSize: '11px',
                          color: '#666',
                        }}
                      >
                        ID : {t.id}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '5px 9px',
                        borderRadius: '8px',
                        background: status.bg,
                        border: `1px solid ${status.border}`,
                        color: status.color,
                        fontSize: '10px',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statutLabel(t.statut)}
                    </div>
                  </div>

                  {/* UTILISATEURS */}
                  <div
                    style={{
                      background: '#111',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '10px',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <div style={{ color: '#666', marginBottom: '3px' }}>
                          Client
                        </div>

                        <div style={{ fontWeight: '700' }}>
                          {t.client?.nom || '-'}
                        </div>

                        {t.client?.telephone && (
                          <div style={{ color: '#777', marginTop: '2px' }}>
                            {t.client.telephone}
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ color: '#666', marginBottom: '3px' }}>
                          Vendeur
                        </div>

                        <div style={{ fontWeight: '700' }}>
                          {t.vendeur?.nom || '-'}
                        </div>

                        {t.vendeur?.telephone && (
                          <div style={{ color: '#777', marginTop: '2px' }}>
                            {t.vendeur.telephone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* INFOS FINANCIÈRES */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '10px',
                      fontSize: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#666' }}>
                        Type
                      </span>

                      <br />

                      <strong>
                        {typeLabel(t.type)}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#666' }}>
                        Montant total
                      </span>

                      <br />

                      <strong>
                        {formatMoney(t.montant_total)} FCFA
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#666' }}>
                        Montant payé
                      </span>

                      <br />

                      <strong style={{ color: '#FF5C00' }}>
                        {formatMoney(t.montant_paye)} FCFA
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#666' }}>
                        Commission
                      </span>

                      <br />

                      <strong>
                        {formatMoney(t.commission_plateforme)} FCFA
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#666' }}>
                        Méthode
                      </span>

                      <br />

                      <strong>
                        {t.methode_paiement || '-'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: '#666' }}>
                        Date
                      </span>

                      <br />

                      <strong>
                        {formatDate(t.created_at)}
                      </strong>
                    </div>
                  </div>

                  {/* RESERVATION */}
                  {t.reservation_id && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        background: 'rgba(255,92,0,0.06)',
                        border: '1px solid rgba(255,92,0,0.2)',
                        borderRadius: '10px',
                        fontSize: '11px',
                        color: '#AAA',
                      }}
                    >
                      📦 Cette transaction est liée à une réservation.
                    </div>
                  )}

                  {/* LITIGE */}
                  {t.statut === 'litige' && (
                    <button
                      onClick={() => router.push('/admin/litiges')}
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
                      ⚠️ Voir le litige
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}