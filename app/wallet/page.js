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

    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    setWallet(walletData)

    const { data: txData } = await supabase
      .from('transactions')
      .select('*, promotions(titre)')
      .or(`client_id.eq.${data.user.id},vendeur_id.eq.${data.user.id}`)
      .order('created_at', { ascending: false })
      .limit(10)

    setTransactions(txData || [])
    setLoading(false)
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Chargement...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', gap: '12px', zIndex: 100,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: '36px', height: '36px',
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '10px', color: 'white',
            fontSize: '16px', cursor: 'pointer',
          }}
        >
          ←
        </button>

        <div style={{ fontSize: '18px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
          💰 Portefeuille
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Solde, dépôts, retraits et fonds reçus.
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF5C00, #FF8A00)',
          borderRadius: '22px',
          padding: '24px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '10px' }}>
            Solde disponible
          </div>

          <div style={{ fontSize: '34px', fontWeight: '900', marginBottom: '4px' }}>
            {formatMoney(wallet?.solde_disponible)} FCFA
          </div>

          <div style={{ fontSize: '12px', opacity: 0.85 }}>
            Fonds bloqués : {formatMoney(wallet?.solde_bloque)} FCFA
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => alert('Recharge bientôt disponible avec CinetPay.')}
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
            onClick={() => alert('Retrait bientôt disponible.')}
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
            onClick={() => router.push('/transactions')}
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

        <div style={{
          background: '#1A1A1A',
          borderRadius: '16px',
          border: '1px solid #2A2A2A',
          padding: '16px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>
            Activité récente
          </div>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
              Aucune activité pour le moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map(t => (
                <div key={t.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderBottom: '1px solid #252525',
                  paddingBottom: '12px',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>
                      {t.promotions?.titre || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                      {t.type === 'achat_direct' ? 'Achat direct' : 'Réservation'} · {t.statut}
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#FF5C00', whiteSpace: 'nowrap' }}>
                    {formatMoney(t.montant_paye)} FCFA
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}