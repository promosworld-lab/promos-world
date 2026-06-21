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

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/auth')
      return
    }

    setUser(data.user)
    await fetchTransactions(data.user.id)
  }

  const fetchTransactions = async (userId) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('transactions')
      .select('*, promotions(titre, photo_url, media_type), vendeur:profiles!transactions_vendeur_id_fkey(nom), client:profiles!transactions_client_id_fkey(nom)')
      .or(`client_id.eq.${userId},vendeur_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (!error) setTransactions(data || [])

    setLoading(false)
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

  const statutLabel = (statut) => {
    if (statut === 'bloque') return 'Fonds bloqués'
    if (statut === 'libere') return 'Fonds libérés'
    if (statut === 'rembourse') return 'Remboursé'
    if (statut === 'litige') return 'Litige'
    return statut
  }

  const statutColor = (statut) => {
    if (statut === 'libere') return '#00C48C'
    if (statut === 'bloque') return '#FFB800'
    if (statut === 'rembourse') return '#888'
    if (statut === 'litige') return '#FF3C3C'
    return '#888'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 100,
      }}>
        <button onClick={() => router.push('/')} style={{
          width: '36px', height: '36px', background: '#1A1A1A',
          border: '1px solid #2A2A2A', borderRadius: '10px',
          color: 'white', fontSize: '16px', cursor: 'pointer',
        }}>
          ←
        </button>

        <div style={{ fontSize: '18px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
          💳 Transactions
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Suivi des achats directs et réservations.
        </div>

        {successId && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            background: 'rgba(0,196,140,0.1)',
            border: '1px solid #00C48C',
            color: '#00C48C',
            fontSize: '13px',
          }}>
            ✅ Achat confirmé. Les fonds sont bloqués jusqu’à confirmation de réception.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Chargement...</div>
        ) : transactions.length === 0 ? (
          <div style={{
            textAlign: 'center', color: '#888',
            padding: '60px 20px', background: '#1A1A1A',
            borderRadius: '16px', border: '1px solid #2A2A2A',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💳</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Aucune transaction</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map(t => {
              const isClient = t.client_id === user?.id
              const otherName = isClient ? t.vendeur?.nom : t.client?.nom

              return (
                <div key={t.id} style={{
                  background: '#1A1A1A',
                  borderRadius: '16px',
                  border: '1px solid #2A2A2A',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                        {t.promotions?.titre || 'Transaction'}
                      </div>

                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {isClient ? 'Vendeur' : 'Client'} : {otherName || '-'}
                      </div>
                    </div>

                    <div style={{
                      color: statutColor(t.statut),
                      fontSize: '12px',
                      fontWeight: '700',
                      textAlign: 'right',
                    }}>
                      {statutLabel(t.statut)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#888' }}>Type</span>
                    <span>{t.type === 'achat_direct' ? 'Achat direct' : 'Réservation'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#888' }}>Montant payé</span>
                    <span style={{ color: '#FF5C00', fontWeight: '700' }}>{formatMoney(t.montant_paye)} FCFA</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#888' }}>Commission plateforme</span>
                    <span>{formatMoney(t.commission_plateforme)} FCFA</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#888' }}>Date</span>
                    <span>{t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '-'}</span>
                  </div>

                  {t.statut === 'bloque' && isClient && (
                    <button
                      onClick={() => router.push('/litiges')}
                      style={{
                        width: '100%', marginTop: '12px', padding: '10px',
                        background: 'transparent', border: '1px solid #FF3C3C',
                        borderRadius: '10px', color: '#FF3C3C',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                      }}
                    >
                      ⚠️ Signaler un problème
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

export default function Transactions() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#888',
        fontFamily: 'sans-serif',
      }}>
        Chargement...
      </div>
    }>
      <TransactionsContent />
    </Suspense>
  )
}