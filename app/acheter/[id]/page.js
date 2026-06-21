'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Acheter() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [methodePaiement, setMethodePaiement] = useState('orange')
  const [message, setMessage] = useState('')

  const methodes = [
    { id: 'orange', label: 'Orange Money', icon: '📱' },
    { id: 'mtn', label: 'MTN Mobile Money', icon: '📲' },
    { id: 'wave', label: 'Wave', icon: '🌊' },
    { id: 'moov', label: 'Moov Money', icon: '💜' },
    { id: 'carte', label: 'Carte bancaire', icon: '💳' },
  ]

  useEffect(() => {
    initPage()
  }, [id])

  const initPage = async () => {
    setLoading(true)

    const { data: authData } = await supabase.auth.getUser()

    if (!authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    const { data, error } = await supabase
      .from('promotions')
      .select('*, profiles(nom, adresse)')
      .eq('id', id)
      .single()

    if (!error) setPromo(data)

    setLoading(false)
  }

  const handleAcheter = async () => {
    if (!user || !promo || processing) return

    setProcessing(true)
    setMessage('')

    if (promo.statut !== 'actif') {
      setMessage('Cette promo n’est pas active.')
      setProcessing(false)
      return
    }

    if (Number(promo.stock) <= 0) {
      setMessage('Stock épuisé.')
      setProcessing(false)
      return
    }

    const montantTotal = Number(promo.prix_promo)
    const commission = Math.round(montantTotal * 0.02)

    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'achat_direct',
        client_id: user.id,
        vendeur_id: promo.vendeur_id,
        promotion_id: promo.id,
        reservation_id: null,
        montant_total: montantTotal,
        montant_paye: montantTotal,
        commission_plateforme: commission,
        methode_paiement: methodePaiement,
        statut: 'bloque',
      })
      .select()
      .single()

    if (transactionError) {
      setMessage(`Erreur achat : ${transactionError.message}`)
      setProcessing(false)
      return
    }

    await supabase
      .from('promotions')
      .update({ stock: Number(promo.stock) - 1 })
      .eq('id', promo.id)

    router.push(`/transactions?success=${transactionData.id}`)
  }

  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Chargement...
      </div>
    )
  }

  if (!promo) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
        Promotion introuvable.
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

        <div style={{ fontSize: '16px', fontWeight: '700' }}>
          Achat direct
        </div>
      </div>

      <div style={{ paddingTop: '70px', maxWidth: '500px', margin: '0 auto', padding: '80px 20px 40px' }}>
        <div style={{
          background: '#1A1A1A',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid #2A2A2A',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>ARTICLE</div>
          <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{promo.titre}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            🏪 {promo.profiles?.nom} · {promo.profiles?.adresse || 'Adresse non précisée'}
          </div>
        </div>

        <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
          Mode de paiement
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {methodes.map(m => (
            <div
              key={m.id}
              onClick={() => setMethodePaiement(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: methodePaiement === m.id ? '1px solid #FF5C00' : '1px solid #2A2A2A',
                background: methodePaiement === m.id ? 'rgba(255,92,0,0.08)' : '#1A1A1A',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                background: '#252525',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {m.icon}
              </div>

              <div style={{ flex: 1, fontSize: '13px', fontWeight: '500' }}>{m.label}</div>

              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: methodePaiement === m.id ? '2px solid #FF5C00' : '2px solid #444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                color: '#FF5C00',
              }}>
                {methodePaiement === m.id ? '●' : ''}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#1A1A1A',
          borderRadius: '14px',
          padding: '14px',
          border: '1px solid #2A2A2A',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
            <span style={{ color: '#888' }}>Prix à payer</span>
            <span style={{ fontWeight: '800', color: '#FF5C00' }}>{formatMoney(promo.prix_promo)} FCFA</span>
          </div>

          <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
            L’argent sera bloqué par Promo’s World. Le vendeur recevra son argent après confirmation de réception.
          </div>
        </div>

        <div style={{
          background: 'rgba(255,92,0,0.08)',
          borderRadius: '12px',
          padding: '12px 14px',
          border: '1px solid rgba(255,92,0,0.2)',
          fontSize: '12px',
          color: '#888',
          marginBottom: '20px',
          lineHeight: '1.6',
        }}>
          🔒 En V1, ce bouton simule le paiement. CinetPay sera branché ensuite.
        </div>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '16px',
            background: 'rgba(255,60,60,0.1)',
            border: '1px solid #FF3C3C',
            color: '#FF3C3C',
            fontSize: '13px',
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleAcheter}
          disabled={processing}
          style={{
            width: '100%',
            padding: '15px',
            background: processing ? '#333' : '#00C48C',
            border: 'none',
            borderRadius: '14px',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            cursor: processing ? 'not-allowed' : 'pointer',
          }}
        >
          {processing ? 'Traitement...' : `Payer ${formatMoney(promo.prix_promo)} FCFA`}
        </button>
      </div>
    </div>
  )
}