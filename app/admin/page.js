'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    promotions: 0,
    reservations: 0,
    transactions: 0,
    litiges: 0,
    utilisateurs: 0,
    transactionsBloquees: 0,
  })

  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    const userId = authData.user.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, nom')
      .eq('id', userId)
      .single()

    if (profileError || profile?.role !== 'admin') {
      router.push('/')
      return
    }

    await loadStats()

    setLoading(false)
  }

  const loadStats = async () => {
    const [
      promotionsResult,
      reservationsResult,
      transactionsResult,
      litigesResult,
      usersResult,
      blockedResult,
    ] = await Promise.all([
      supabase
        .from('promotions')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('litiges')
        .select('id', { count: 'exact', head: true })
        .neq('statut', 'resolu'),

      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),

      supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('statut', 'bloque'),
    ])

    setStats({
      promotions: promotionsResult.count || 0,
      reservations: reservationsResult.count || 0,
      transactions: transactionsResult.count || 0,
      litiges: litigesResult.count || 0,
      utilisateurs: usersResult.count || 0,
      transactionsBloquees: blockedResult.count || 0,
    })
  }

  const adminCards = [
    {
      title: 'Promotions',
      description: 'Gérer les promotions publiées et les validations.',
      icon: '📦',
      path: '/admin/promotions',
      value: stats.promotions,
    },
    {
      title: 'Réservations',
      description: 'Suivre les réservations et leur évolution.',
      icon: '📋',
      path: '/dashboard/reservations',
      value: stats.reservations,
    },
    {
      title: 'Transactions',
      description: 'Voir les paiements, commissions et fonds bloqués.',
      icon: '💳',
      path: '/admin/transactions',
      value: stats.transactions,
    },
    {
      title: 'Litiges',
      description: 'Traiter les problèmes signalés par les clients.',
      icon: '⚠️',
      path: '/admin/litiges',
      value: stats.litiges,
      alert: stats.litiges > 0,
    },
    {
      title: 'Utilisateurs',
      description: 'Consulter les comptes et les rôles.',
      icon: '👥',
      path: '/admin/utilisateurs',
      value: stats.utilisateurs,
    },
  ]

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
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>

        <div
          style={{
            marginLeft: 'auto',
            fontSize: '12px',
            color: '#FF5C00',
            fontWeight: '800',
          }}
        >
          ADMIN
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
            fontSize: '24px',
            fontWeight: '900',
            marginBottom: '6px',
          }}
        >
          🛠️ Administration
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Gestion globale de Promo's World.
        </div>

        {/* ERREUR */}
        {error && (
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
            {error}
          </div>
        )}

        {/* STATISTIQUES */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <StatCard
            label="Promotions"
            value={stats.promotions}
            icon="📦"
          />

          <StatCard
            label="Réservations"
            value={stats.reservations}
            icon="📋"
          />

          <StatCard
            label="Transactions"
            value={stats.transactions}
            icon="💳"
          />

          <StatCard
            label="Fonds bloqués"
            value={stats.transactionsBloquees}
            icon="🔒"
          />

          <StatCard
            label="Litiges ouverts"
            value={stats.litiges}
            icon="⚠️"
            alert={stats.litiges > 0}
          />

          <StatCard
            label="Utilisateurs"
            value={stats.utilisateurs}
            icon="👥"
          />
        </div>

        {/* MENU ADMIN */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: '800',
            marginBottom: '12px',
          }}
        >
          Gestion
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {adminCards.map((card) => (
            <button
              key={card.title}
              onClick={() => router.push(card.path)}
              style={{
                textAlign: 'left',
                background: '#1A1A1A',
                border: card.alert
                  ? '1px solid #FFB800'
                  : '1px solid #2A2A2A',
                borderRadius: '16px',
                padding: '18px',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#252525',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >
                  {card.icon}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '900',
                    color: card.alert
                      ? '#FFB800'
                      : '#FF5C00',
                  }}
                >
                  {card.value}
                </div>
              </div>

              <div
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  marginBottom: '5px',
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  lineHeight: '1.5',
                }}
              >
                {card.description}
              </div>
            </button>
          ))}
        </div>

        {/* TRANSACTIONS BLOQUÉES */}
        <div
          style={{
            marginTop: '28px',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '18px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '800',
              marginBottom: '8px',
            }}
          >
            🔒 Sécurité financière
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#888',
              lineHeight: '1.6',
              marginBottom: '14px',
            }}
          >
            Les transactions dont les fonds sont actuellement bloqués
            doivent être suivies avant leur libération ou leur remboursement.
          </div>

          <button
            onClick={() => router.push('/admin/transactions')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#252525',
              border: '1px solid #333',
              borderRadius: '10px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Voir les transactions →
          </button>
        </div>

        {/* LITIGES */}
        {stats.litiges > 0 && (
          <div
            style={{
              marginTop: '12px',
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid #FFB800',
              borderRadius: '16px',
              padding: '18px',
            }}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                marginBottom: '6px',
              }}
            >
              ⚠️ Action requise
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#BBB',
                marginBottom: '14px',
              }}
            >
              {stats.litiges} litige
              {stats.litiges > 1 ? 's' : ''} nécessite
              {stats.litiges > 1 ? 'nt' : ''} une décision administrative.
            </div>

            <button
              onClick={() => router.push('/admin/litiges')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#FFB800',
                border: 'none',
                borderRadius: '10px',
                color: '#000',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Traiter les litiges →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  alert = false,
}) {
  return (
    <div
      style={{
        background: '#1A1A1A',
        border: alert
          ? '1px solid #FFB800'
          : '1px solid #2A2A2A',
        borderRadius: '16px',
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '20px',
          marginBottom: '8px',
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: '24px',
          fontWeight: '900',
          color: alert ? '#FFB800' : '#FF5C00',
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: '11px',
          color: '#888',
          marginTop: '3px',
        }}
      >
        {label}
      </div>
    </div>
  )
}