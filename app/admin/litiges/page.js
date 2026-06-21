'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLitiges() {
  const router = useRouter()
  const [litiges, setLitiges] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

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

    const { data: litigeData } = await supabase
      .from('litiges')
      .select('*, client:profiles!litiges_client_id_fkey(nom, telephone), transactions(montant_paye, statut, promotions(titre))')
      .order('created_at', { ascending: false })

    setLitiges(litigeData || [])
    setLoading(false)
  }

  const handleResolve = async (litige, decision) => {
    setMessage('')

    await supabase
      .from('litiges')
      .update({
        statut: 'resolu',
        decision_admin: decision,
      })
      .eq('id', litige.id)

    if (decision === 'remboursement_client') {
      await supabase
        .from('transactions')
        .update({ statut: 'rembourse' })
        .eq('id', litige.transaction_id)
    }

    if (decision === 'versement_vendeur') {
      await supabase
        .from('transactions')
        .update({ statut: 'libere' })
        .eq('id', litige.transaction_id)
    }

    setMessage('✅ Litige traité.')
    await initPage()
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        Chargement...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 100,
      }}>
        <button onClick={() => router.push('/admin')} style={{
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

      <div style={{ padding: '80px 20px 40px', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
          ⚠️ Litiges admin
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Analyse les problèmes signalés par les clients.
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: 'rgba(0,196,140,0.1)',
            border: '1px solid #00C48C',
            color: '#00C48C',
            fontSize: '13px',
          }}>
            {message}
          </div>
        )}

        {litiges.length === 0 ? (
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '50px',
            textAlign: 'center',
            color: '#888',
          }}>
            Aucun litige.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {litiges.map(l => (
              <div key={l.id} style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '16px',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>
                      {l.transactions?.promotions?.titre || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Client : {l.client?.nom || '-'} {l.client?.telephone ? `· ${l.client.telephone}` : ''}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: l.statut === 'resolu' ? '#00C48C' : '#FFB800',
                    fontWeight: '800',
                  }}>
                    {l.statut}
                  </div>
                </div>

                <div style={{
                  background: '#111',
                  border: '1px solid #252525',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '13px',
                  color: '#ccc',
                  marginBottom: '12px',
                  lineHeight: '1.5',
                }}>
                  {l.motif}
                </div>

                {l.decision_admin && (
                  <div style={{ fontSize: '12px', color: '#00C48C', marginBottom: '12px' }}>
                    Décision : {l.decision_admin}
                  </div>
                )}

                {l.statut !== 'resolu' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleResolve(l, 'remboursement_client')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(0,196,140,0.12)',
                        border: '1px solid #00C48C',
                        color: '#00C48C',
                        borderRadius: '10px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      Rembourser client
                    </button>

                    <button
                      onClick={() => handleResolve(l, 'versement_vendeur')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255,92,0,0.12)',
                        border: '1px solid #FF5C00',
                        color: '#FF5C00',
                        borderRadius: '10px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      Verser vendeur
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}