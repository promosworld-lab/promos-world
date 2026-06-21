'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Litiges() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [litiges, setLitiges] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactionId, setTransactionId] = useState('')
  const [motif, setMotif] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

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

    const { data: txData } = await supabase
      .from('transactions')
      .select('id, type, statut, montant_paye, promotion_id, promotions(titre)')
      .eq('client_id', data.user.id)
      .in('statut', ['bloque', 'litige'])
      .order('created_at', { ascending: false })

    setTransactions(txData || [])

    const { data: litigeData } = await supabase
      .from('litiges')
      .select('*, transactions(montant_paye, promotions(titre))')
      .eq('client_id', data.user.id)
      .order('created_at', { ascending: false })

    setLitiges(litigeData || [])
    setLoading(false)
  }

  const handleCreateLitige = async () => {
    if (!transactionId || !motif.trim()) {
      setMessage('Choisis une transaction et explique le problème.')
      return
    }

    setSaving(true)
    setMessage('')

    const tx = transactions.find(t => t.id === transactionId)

    const { error } = await supabase.from('litiges').insert({
      transaction_id: transactionId,
      client_id: user.id,
      promotion_id: tx?.promotion_id || null,
      motif: motif.trim(),
      statut: 'ouvert',
    })

    if (error) {
      setMessage(`Erreur : ${error.message}`)
      setSaving(false)
      return
    }

    await supabase
      .from('transactions')
      .update({ statut: 'litige' })
      .eq('id', transactionId)

    setTransactionId('')
    setMotif('')
    setMessage('✅ Litige envoyé à l’admin.')
    await initPage()
    setSaving(false)
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

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
        <button onClick={() => router.back()} style={{
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
          ⚠️ Litiges
        </div>

        <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>
          Signale un problème si tu n’as pas reçu ton article ou si la transaction s’est mal passée.
        </div>

        <div style={{
          background: '#1A1A1A',
          borderRadius: '16px',
          border: '1px solid #2A2A2A',
          padding: '18px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>
            Ouvrir un litige
          </div>

          <select
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            style={{
              width: '100%', padding: '12px',
              background: '#111', border: '1px solid #333',
              borderRadius: '10px', color: 'white',
              marginBottom: '12px',
            }}
          >
            <option value="">Choisir une transaction</option>
            {transactions.map(t => (
              <option key={t.id} value={t.id}>
                {t.promotions?.titre || 'Transaction'} — {formatMoney(t.montant_paye)} FCFA
              </option>
            ))}
          </select>

          <textarea
            value={motif}
            onChange={e => setMotif(e.target.value)}
            placeholder="Explique le problème..."
            rows={4}
            style={{
              width: '100%', padding: '12px',
              background: '#111', border: '1px solid #333',
              borderRadius: '10px', color: 'white',
              resize: 'none', boxSizing: 'border-box',
              marginBottom: '12px',
            }}
          />

          {message && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '12px',
              background: message.includes('Erreur') || message.includes('Choisis') ? 'rgba(255,60,60,0.1)' : 'rgba(0,196,140,0.1)',
              border: `1px solid ${message.includes('Erreur') || message.includes('Choisis') ? '#FF3C3C' : '#00C48C'}`,
              color: message.includes('Erreur') || message.includes('Choisis') ? '#FF3C3C' : '#00C48C',
              fontSize: '13px',
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleCreateLitige}
            disabled={saving}
            style={{
              width: '100%', padding: '14px',
              background: saving ? '#333' : '#FF3C3C',
              border: 'none', borderRadius: '12px',
              color: 'white', fontWeight: '800',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Envoi...' : 'Envoyer le litige'}
          </button>
        </div>

        <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>
          Mes litiges
        </div>

        {litiges.length === 0 ? (
          <div style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            color: '#888',
          }}>
            Aucun litige pour le moment.
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
                <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '6px' }}>
                  {l.transactions?.promotions?.titre || 'Transaction'}
                </div>

                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                  {l.motif}
                </div>

                <div style={{ fontSize: '12px', color: '#FF5C00', fontWeight: '700' }}>
                  Statut : {l.statut}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}