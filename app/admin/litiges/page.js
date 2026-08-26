'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLitiges() {
  const router = useRouter()

  const [litiges, setLitiges] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data.user) {
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

    await fetchLitiges()

    setLoading(false)
  }

  const fetchLitiges = async () => {
    const { data, error } = await supabase
      .from('litiges')
      .select(`
        *,
        client:profiles!litiges_client_id_fkey(
          nom,
          telephone
        ),
        transactions(
          id,
          montant_total,
          montant_paye,
          commission_plateforme,
          statut,
          type,
          promotions(
            titre
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération litiges:', error)
      setError(`Impossible de récupérer les litiges : ${error.message}`)
      return
    }

    setLitiges(data || [])
  }

  const handleResolve = async (litige, decision) => {
    if (!litige?.id) return

    const confirmation =
      decision === 'remboursement_client'
        ? 'Confirmer le remboursement du client ?'
        : 'Confirmer le versement des fonds au vendeur ?'

    if (!window.confirm(confirmation)) {
      return
    }

    setProcessingId(litige.id)
    setMessage('')
    setError('')

    const { data, error } = await supabase.rpc(
      'resolve_reservation_dispute',
      {
        p_litige_id: litige.id,
        p_decision: decision,
      }
    )

    if (error) {
      console.error('Erreur résolution litige:', error)

      setError(
        `Erreur lors du traitement du litige : ${error.message}`
      )

      setProcessingId(null)
      return
    }

    if (data?.success === false) {
      setError(
        data.message || 'Le litige n’a pas pu être traité.'
      )

      setProcessingId(null)
      return
    }

    if (decision === 'remboursement_client') {
      setMessage('✅ Le client a été remboursé et le litige est résolu.')
    } else {
      setMessage('✅ Les fonds ont été libérés pour le vendeur et le litige est résolu.')
    }

    await fetchLitiges()

    setProcessingId(null)

    setTimeout(() => {
      setMessage('')
    }, 5000)
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

  const getStatutLabel = (statut) => {
    if (statut === 'ouvert') return 'Ouvert'
    if (statut === 'en_cours') return 'En cours'
    if (statut === 'resolu') return 'Résolu'

    return statut || '-'
  }

  const getStatutColor = (statut) => {
    if (statut === 'resolu') return '#00C48C'
    if (statut === 'en_cours') return '#FFB800'

    return '#FF3C3C'
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
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{
          padding: '80px 20px 40px',
          maxWidth: '850px',
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
          ⚠️ Litiges admin
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Analyse et résolution des problèmes signalés par les clients.
        </div>

        {/* SUCCESS */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              background: 'rgba(0,196,140,0.1)',
              border: '1px solid #00C48C',
              color: '#00C48C',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {message}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF3C3C',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        {/* LISTE */}
        {litiges.length === 0 ? (
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '16px',
              padding: '50px',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px',
              }}
            >
              ⚠️
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Aucun litige.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {litiges.map((l) => {
              const transaction = l.transactions
              const promotion = transaction?.promotions
              const isProcessing = processingId === l.id
              const isResolved = l.statut === 'resolu'

              return (
                <div
                  key={l.id}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '16px',
                    padding: '16px',
                  }}
                >
                  {/* TITRE + STATUT */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '800',
                          marginBottom: '5px',
                        }}
                      >
                        {promotion?.titre || 'Transaction'}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#888',
                        }}
                      >
                        Client : {l.client?.nom || '-'}
                        {l.client?.telephone
                          ? ` · ${l.client.telephone}`
                          : ''}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: getStatutColor(l.statut),
                        fontWeight: '800',
                        padding: '5px 9px',
                        borderRadius: '8px',
                        background:
                          l.statut === 'resolu'
                            ? 'rgba(0,196,140,0.1)'
                            : 'rgba(255,60,60,0.1)',
                        height: 'fit-content',
                      }}
                    >
                      {getStatutLabel(l.statut)}
                    </div>
                  </div>

                  {/* MOTIF */}
                  <div
                    style={{
                      background: '#111',
                      border: '1px solid #252525',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#CCC',
                      marginBottom: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#777',
                        marginBottom: '5px',
                      }}
                    >
                      Motif du litige
                    </div>

                    {l.motif || 'Aucun motif renseigné.'}
                  </div>

                  {/* TRANSACTION */}
                  {transaction && (
                    <div
                      style={{
                        background: '#151515',
                        border: '1px solid #252525',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#777',
                          marginBottom: '8px',
                        }}
                      >
                        Informations transaction
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(130px, 1fr))',
                          gap: '10px',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#777' }}>
                            Montant
                          </span>
                          <br />
                          <strong>
                            {formatMoney(transaction.montant_paye)} FCFA
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#777' }}>
                            Commission
                          </span>
                          <br />
                          <strong>
                            {formatMoney(
                              transaction.commission_plateforme
                            )}{' '}
                            FCFA
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#777' }}>
                            Statut transaction
                          </span>
                          <br />
                          <strong>
                            {transaction.statut || '-'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ color: '#777' }}>
                            Date
                          </span>
                          <br />
                          <strong>
                            {formatDate(l.created_at)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DECISION EXISTANTE */}
                  {l.decision_admin && (
                    <div
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(0,196,140,0.08)',
                        border: '1px solid rgba(0,196,140,0.3)',
                        borderRadius: '10px',
                        color: '#00C48C',
                        fontSize: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <strong>Décision :</strong>{' '}
                      {l.decision_admin === 'remboursement_client'
                        ? 'Remboursement client'
                        : l.decision_admin === 'versement_vendeur'
                          ? 'Versement vendeur'
                          : l.decision_admin}
                    </div>
                  )}

                  {/* ACTIONS */}
                  {!isResolved && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() =>
                          handleResolve(
                            l,
                            'remboursement_client'
                          )
                        }
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          minWidth: '180px',
                          padding: '11px',
                          background: isProcessing
                            ? '#333'
                            : 'rgba(0,196,140,0.12)',
                          border: '1px solid #00C48C',
                          color: isProcessing
                            ? '#777'
                            : '#00C48C',
                          borderRadius: '10px',
                          fontWeight: '800',
                          cursor: isProcessing
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        {isProcessing
                          ? 'Traitement...'
                          : '↩️ Rembourser client'}
                      </button>

                      <button
                        onClick={() =>
                          handleResolve(
                            l,
                            'versement_vendeur'
                          )
                        }
                        disabled={isProcessing}
                        style={{
                          flex: 1,
                          minWidth: '180px',
                          padding: '11px',
                          background: isProcessing
                            ? '#333'
                            : 'rgba(255,92,0,0.12)',
                          border: '1px solid #FF5C00',
                          color: isProcessing
                            ? '#777'
                            : '#FF5C00',
                          borderRadius: '10px',
                          fontWeight: '800',
                          cursor: isProcessing
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        {isProcessing
                          ? 'Traitement...'
                          : '💰 Verser vendeur'}
                      </button>
                    </div>
                  )}

                  {/* RESOLU */}
                  {isResolved && (
                    <div
                      style={{
                        padding: '10px',
                        background: 'rgba(0,196,140,0.08)',
                        border: '1px solid rgba(0,196,140,0.25)',
                        borderRadius: '10px',
                        color: '#00C48C',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      ✅ Ce litige a déjà été résolu.
                    </div>
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