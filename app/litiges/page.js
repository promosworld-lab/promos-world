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
  const [saving, setSaving] = useState(false)

  const [transactionId, setTransactionId] = useState('')
  const [motif, setMotif] = useState('')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)

    const {
      data: { user: currentUser },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !currentUser) {
      router.push('/auth')
      return
    }

    setUser(currentUser)

    await Promise.all([
      loadTransactions(currentUser.id),
      loadLitiges(currentUser.id),
    ])

    setLoading(false)
  }

  const loadTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        statut,
        montant_paye,
        promotion_id,
        created_at,
        promotions (
          titre
        )
      `)
      .eq('client_id', userId)
      .in('statut', ['bloque', 'litige'])
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Erreur transactions litiges:',
        error
      )

      setMessage(
        'Impossible de récupérer les transactions.'
      )
      setMessageType('error')

      return
    }

    setTransactions(data || [])
  }

  const loadLitiges = async (userId) => {
    const { data, error } = await supabase
      .from('litiges')
      .select(`
        *,
        transactions (
          id,
          montant_paye,
          statut,
          promotions (
            titre
          )
        )
      `)
      .eq('client_id', userId)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Erreur récupération litiges:',
        error
      )

      setMessage(
        'Impossible de récupérer tes litiges.'
      )
      setMessageType('error')

      return
    }

    setLitiges(data || [])
  }

  const handleCreateLitige = async () => {
    setMessage('')
    setMessageType('')

    if (!transactionId) {
      setMessage(
        'Choisis une transaction concernée.'
      )
      setMessageType('error')
      return
    }

    if (!motif.trim()) {
      setMessage(
        'Explique le problème avant d’envoyer le litige.'
      )
      setMessageType('error')
      return
    }

    if (motif.trim().length < 10) {
      setMessage(
        'Le motif doit contenir au moins 10 caractères.'
      )
      setMessageType('error')
      return
    }

    const transaction = transactions.find(
      (t) => t.id === transactionId
    )

    if (!transaction) {
      setMessage(
        'Cette transaction n’est pas disponible pour un litige.'
      )
      setMessageType('error')
      return
    }

    const existingLitige = litiges.find(
      (l) =>
        l.transaction_id === transactionId &&
        ['ouvert', 'en_cours'].includes(l.statut)
    )

    if (existingLitige) {
      setMessage(
        'Un litige est déjà ouvert pour cette transaction.'
      )
      setMessageType('error')
      return
    }

    setSaving(true)

    /*
     * 1. Création du litige
     */

    const { error: litigeError } =
      await supabase
        .from('litiges')
        .insert({
          transaction_id: transactionId,
          client_id: user.id,
          promotion_id:
            transaction.promotion_id || null,
          motif: motif.trim(),
          statut: 'ouvert',
        })

    if (litigeError) {
      console.error(
        'Erreur création litige:',
        litigeError
      )

      setMessage(
        `Erreur lors de la création du litige : ${litigeError.message}`
      )

      setMessageType('error')
      setSaving(false)

      return
    }

    /*
     * 2. Passage de la transaction en litige
     */

    const { error: transactionError } =
      await supabase
        .from('transactions')
        .update({
          statut: 'litige',
        })
        .eq('id', transactionId)
        .eq('client_id', user.id)

    if (transactionError) {
      console.error(
        'Erreur changement statut transaction:',
        transactionError
      )

      setMessage(
        'Le litige a été créé, mais la transaction n’a pas pu être mise en litige. Contacte l’administration.'
      )

      setMessageType('error')

      await initPage()

      setSaving(false)
      return
    }

    setTransactionId('')
    setMotif('')

    setMessage(
      '✅ Litige envoyé. Les fonds restent bloqués pendant l’examen du dossier.'
    )

    setMessageType('success')

    await initPage()

    setSaving(false)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      'fr-FR'
    )
  }

  const getStatutLabel = (statut) => {
    const labels = {
      ouvert: 'Ouvert',
      en_cours: 'En cours',
      resolu_client: 'Résolu en faveur du client',
      resolu_vendeur: 'Résolu en faveur du vendeur',
      ferme: 'Fermé',
    }

    return labels[statut] || statut
  }

  const getStatutColor = (statut) => {
    if (statut === 'ouvert') {
      return '#FFB800'
    }

    if (statut === 'en_cours') {
      return '#FF5C00'
    }

    if (statut === 'resolu_client') {
      return '#00C48C'
    }

    if (statut === 'resolu_vendeur') {
      return '#888'
    }

    return '#666'
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
          borderBottom:
            '1px solid #1E1E1E',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => router.back()}
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
          ⚠️ Litiges
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Signale un problème concernant une
          transaction. Les fonds concernés
          restent bloqués pendant l’examen du
          dossier.
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              marginBottom: '16px',
              background:
                messageType === 'error'
                  ? 'rgba(255,60,60,0.1)'
                  : 'rgba(0,196,140,0.1)',
              border:
                messageType === 'error'
                  ? '1px solid #FF3C3C'
                  : '1px solid #00C48C',
              color:
                messageType === 'error'
                  ? '#FF3C3C'
                  : '#00C48C',
              fontSize: '13px',
            }}
          >
            {message}
          </div>
        )}

        {/* CREATION LITIGE */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            border:
              '1px solid #2A2A2A',
            padding: '18px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '800',
              marginBottom: '6px',
            }}
          >
            Ouvrir un litige
          </div>

          <div
            style={{
              fontSize: '12px',
              color: '#777',
              marginBottom: '16px',
              lineHeight: 1.5,
            }}
          >
            Utilise cette fonction uniquement
            lorsqu’un problème réel nécessite
            l’intervention de l’administration.
          </div>

          <select
            value={transactionId}
            onChange={(e) =>
              setTransactionId(
                e.target.value
              )
            }
            disabled={
              saving ||
              transactions.length === 0
            }
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border:
                '1px solid #333',
              borderRadius: '10px',
              color: 'white',
              marginBottom: '12px',
              boxSizing: 'border-box',
            }}
          >
            <option value="">
              {transactions.length === 0
                ? 'Aucune transaction disponible'
                : 'Choisir une transaction'}
            </option>

            {transactions.map((t) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.promotions?.titre ||
                  'Transaction'}{' '}
                —{' '}
                {formatMoney(
                  t.montant_paye
                )}{' '}
                FCFA
              </option>
            ))}
          </select>

          <textarea
            value={motif}
            onChange={(e) =>
              setMotif(e.target.value)
            }
            disabled={saving}
            placeholder="Explique précisément le problème rencontré..."
            rows={5}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border:
                '1px solid #333',
              borderRadius: '10px',
              color: 'white',
              resize: 'none',
              boxSizing: 'border-box',
              marginBottom: '12px',
              outline: 'none',
              fontFamily: 'sans-serif',
            }}
          />

          <div
            style={{
              fontSize: '11px',
              color: '#666',
              marginBottom: '12px',
            }}
          >
            {motif.length} caractères
          </div>

          <button
            onClick={handleCreateLitige}
            disabled={
              saving ||
              !transactionId ||
              !motif.trim()
            }
            style={{
              width: '100%',
              padding: '14px',
              background:
                saving ||
                !transactionId ||
                !motif.trim()
                  ? '#333'
                  : '#FF3C3C',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '800',
              cursor:
                saving ||
                !transactionId ||
                !motif.trim()
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {saving
              ? 'Envoi...'
              : '⚠️ Envoyer le litige'}
          </button>
        </div>

        {/* MES LITIGES */}

        <div
          style={{
            fontSize: '16px',
            fontWeight: '800',
            marginBottom: '12px',
          }}
        >
          Mes litiges
        </div>

        {litiges.length === 0 ? (
          <div
            style={{
              background: '#1A1A1A',
              border:
                '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '8px',
              }}
            >
              ✅
            </div>

            <div
              style={{
                fontSize: '13px',
              }}
            >
              Aucun litige pour le moment.
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
            {litiges.map((l) => (
              <div
                key={l.id}
                style={{
                  background: '#1A1A1A',
                  border:
                    '1px solid #2A2A2A',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    gap: '12px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '800',
                    }}
                  >
                    {l.transactions
                      ?.promotions
                      ?.titre ||
                      'Transaction'}
                  </div>

                  <div
                    style={{
                      color:
                        getStatutColor(
                          l.statut
                        ),
                      fontSize: '11px',
                      fontWeight: '700',
                      whiteSpace:
                        'nowrap',
                    }}
                  >
                    {getStatutLabel(
                      l.statut
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#888',
                    lineHeight: 1.5,
                    marginBottom: '10px',
                  }}
                >
                  {l.motif}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    fontSize: '11px',
                    color: '#666',
                  }}
                >
                  <span>
                    Montant :{' '}
                    {formatMoney(
                      l.transactions
                        ?.montant_paye
                    )}{' '}
                    FCFA
                  </span>

                  <span>
                    {l.created_at
                      ? new Date(
                          l.created_at
                        ).toLocaleDateString(
                          'fr-FR'
                        )
                      : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}