'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminTransactions() {
  const router = useRouter()
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/')
      return
    }

    const { data: txData } = await supabase
      .from('transactions')
      .select('*, promotions(titre), client:profiles!transactions_client_id_fkey(nom), vendeur:profiles!transactions_vendeur_id_fkey(nom)')
      .order('created_at', { ascending: false })

    setTransactions(txData || [])
    setLoading(false)
  }

  const formatMoney = value => Number(value || 0).toLocaleString('fr-FR')

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#0A0A0A', borderBottom: '1px solid #1E1E1E', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 100 }}>
        <button onClick={() => router.push('/admin')} style={{ width: '36px', height: '36px', background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '10px', color: 'white', fontSize: '16px', cursor: 'pointer' }}>←</button>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#FF5C00' }}>Promo's<span style={{ color: 'white' }}>World</span></div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800' }}>💳 Transactions admin</h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Vue globale des paiements, commissions et fonds bloqués.</p>

        {loading ? (
          <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Chargement...</div>
        ) : transactions.length === 0 ? (
          <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '50px', textAlign: 'center', color: '#888' }}>
            Aucune transaction.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map(t => (
              <div key={t.id} style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{t.promotions?.titre || 'Transaction'}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      Client : {t.client?.nom || '-'} · Vendeur : {t.vendeur?.nom || '-'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: t.statut === 'libere' ? '#00C48C' : t.statut === 'bloque' ? '#FFB800' : '#FF3C3C' }}>
                    {t.statut}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', fontSize: '13px' }}>
                  <div><span style={{ color: '#888' }}>Type</span><br />{t.type}</div>
                  <div><span style={{ color: '#888' }}>Montant total</span><br />{formatMoney(t.montant_total)} FCFA</div>
                  <div><span style={{ color: '#888' }}>Payé</span><br />{formatMoney(t.montant_paye)} FCFA</div>
                  <div><span style={{ color: '#888' }}>Commission</span><br />{formatMoney(t.commission_plateforme)} FCFA</div>
                  <div><span style={{ color: '#888' }}>Méthode</span><br />{t.methode_paiement || '-'}</div>
                  <div><span style={{ color: '#888' }}>Date</span><br />{t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : '-'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}