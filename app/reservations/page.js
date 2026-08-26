'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function MesReservations() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [onglet, setOnglet] = useState('actives')
  const [message, setMessage] = useState('')
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      router.push('/auth')
      return
    }

    setUser(data.user)
    await fetchReservations(data.user.id)
  }

  const fetchReservations = async (userId) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        promotions(
          titre,
          prix_promo,
          prix_original,
          photo_url,
          media_type,
          vendeur_id,
          profiles(nom, adresse)
        )
      `)
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur réservations:', error)
      setMessage('Impossible de charger tes réservations.')
    } else {
      setReservations(data || [])
    }

    setLoading(false)
  }

  const callRpc = async (functionName, params = {}) => {
    if (!user || processing) return

    setProcessing(functionName)
    setMessage('')

    const { data, error } = await supabase.rpc(
      functionName,
      params
    )

    if (error) {
      console.error(`Erreur RPC ${functionName}:`, error)
      setMessage(`Erreur : ${error.message}`)
      setProcessing(null)
      return false
    }

    if (data?.success === false) {
      setMessage(data.message || 'Opération impossible.')
      setProcessing(null)
      return false
    }

    await fetchReservations(user.id)

    setMessage(data?.message || 'Opération effectuée avec succès.')
    setProcessing(null)

    setTimeout(() => setMessage(''), 4000)

    return true
  }

  const handlePaiementSolde = async (reservation) => {
    if (
      !window.confirm(
        `Confirmer le paiement du solde de ${formatMoney(
          reservation.montant_restant
        )} FCFA depuis ton portefeuille ?`
      )
    ) {
      return
    }

    await callRpc(
      'pay_reservation_balance',
      {
        p_reservation_id: reservation.id,
      }
    )
  }

  const handleConfirmationReception = async (reservation) => {
    if (
      !window.confirm(
        'Confirmer que tu as reçu l’article et qu’il correspond à ta réservation ?'
      )
    ) {
      return
    }

    await callRpc(
      'confirm_reservation_reception',
      {
        p_reservation_id: reservation.id,
      }
    )
  }

  const handleOuvertureLitige = async (reservation) => {
    const motif = window.prompt(
      'Explique brièvement le problème rencontré :'
    )

    if (!motif || !motif.trim()) return

    await callRpc(
      'open_reservation_dispute',
      {
        p_reservation_id: reservation.id,
        p_motif: motif.trim(),
      }
    )
  }

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString('fr-FR')

  const formatDate = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleDateString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    )
  }

  const formatDateTime = (value) => {
    if (!value) return '-'

    return new Date(value).toLocaleString(
      'fr-FR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  const statutInfo = (reservation) => {
    const statut = reservation.statut

    if (statut === 'acompte_paye') {
      if (reservation.paiement_complet) {
        return {
          label: 'Solde payé',
          bg: 'rgba(0,196,140,0.12)',
          color: '#00C48C',
        }
      }

      if (reservation.vendeur_decision === 'acceptee') {
        return {
          label: 'Acceptée par le vendeur',
          bg: 'rgba(0,196,140,0.12)',
          color: '#00C48C',
        }
      }

      if (reservation.vendeur_decision === 'refusee') {
        return {
          label: 'Refusée',
          bg: 'rgba(255,60,60,0.1)',
          color: '#FF3C3C',
        }
      }

      return {
        label: 'En attente du vendeur',
        bg: 'rgba(255,184,0,0.12)',
        color: '#FFB800',
      }
    }

    if (statut === 'solde_paye') {
      return {
        label: 'Solde payé',
        bg: 'rgba(0,196,140,0.12)',
        color: '#00C48C',
      }
    }

    if (statut === 'expedition_en_attente') {
      return {
        label: 'Expédition en attente',
        bg: 'rgba(255,184,0,0.12)',
        color: '#FFB800',
      }
    }

    if (statut === 'expediee') {
      return {
        label: 'Expédiée',
        bg: 'rgba(77,166,255,0.12)',
        color: '#4DA6FF',
      }
    }

    if (statut === 'livree') {
      return {
        label: 'Livrée',
        bg: 'rgba(77,166,255,0.12)',
        color: '#4DA6FF',
      }
    }

    if (statut === 'inspection') {
      return {
        label: 'En inspection',
        bg: 'rgba(255,184,0,0.12)',
        color: '#FFB800',
      }
    }

    if (statut === 'terminee') {
      return {
        label: 'Terminée',
        bg: 'rgba(0,196,140,0.15)',
        color: '#00C48C',
      }
    }

    if (statut === 'litige') {
      return {
        label: 'Litige',
        bg: 'rgba(255,92,0,0.15)',
        color: '#FF5C00',
      }
    }

    if (statut === 'annulee') {
      return {
        label: 'Annulée',
        bg: 'rgba(255,60,60,0.1)',
        color: '#FF3C3C',
      }
    }

    if (statut === 'expiree') {
      return {
        label: 'Expirée',
        bg: 'rgba(255,255,255,0.06)',
        color: '#888',
      }
    }

    return {
      label: statut || 'Inconnu',
      bg: 'rgba(255,255,255,0.06)',
      color: '#888',
    }
  }

  const isActive = (r) => {
    return [
      'acompte_paye',
      'solde_paye',
      'expedition_en_attente',
      'expediee',
      'livree',
      'inspection',
      'litige',
    ].includes(r.statut)
  }

  const reservationsFiltrees = reservations.filter((r) => {
    if (onglet === 'actives') return isActive(r)
    if (onglet === 'terminees') return r.statut === 'terminee'
    if (onglet === 'annulees') return r.statut === 'annulee'
    if (onglet === 'expirees') return r.statut === 'expiree'

    return true
  })

  const onglets = [
    {
      key: 'actives',
      label: '⏳ En cours',
    },
    {
      key: 'terminees',
      label: '✅ Terminées',
    },
    {
      key: 'annulees',
      label: '❌ Annulées',
    },
    {
      key: 'expirees',
      label: '⌛ Expirées',
    },
  ]

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
          📋 Mes réservations
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Suivi complet de tes réservations, paiements,
          expéditions et livraisons.
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              background:
                message.startsWith('Erreur')
                  ? 'rgba(255,60,60,0.1)'
                  : 'rgba(0,196,140,0.1)',
              border:
                message.startsWith('Erreur')
                  ? '1px solid #FF3C3C'
                  : '1px solid #00C48C',
              color:
                message.startsWith('Erreur')
                  ? '#FF3C3C'
                  : '#00C48C',
              fontSize: '13px',
            }}
          >
            {message}
          </div>
        )}

        {/* ONGLETS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          {onglets.map((o) => {
            const count =
              o.key === 'actives'
                ? reservations.filter(isActive).length
                : o.key === 'terminees'
                  ? reservations.filter(
                      (r) => r.statut === 'terminee'
                    ).length
                  : o.key === 'annulees'
                    ? reservations.filter(
                        (r) => r.statut === 'annulee'
                      ).length
                    : reservations.filter(
                        (r) => r.statut === 'expiree'
                      ).length

            return (
              <button
                key={o.key}
                onClick={() => setOnglet(o.key)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border:
                    onglet === o.key
                      ? '1px solid #FF5C00'
                      : '1px solid #2A2A2A',
                  background:
                    onglet === o.key
                      ? 'rgba(255,92,0,0.1)'
                      : '#1A1A1A',
                  color:
                    onglet === o.key
                      ? '#FF5C00'
                      : '#888',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                {o.label}

                <span
                  style={{
                    marginLeft: '6px',
                    background: '#2A2A2A',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#888',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              color: '#888',
              padding: '40px',
            }}
          >
            Chargement...
          </div>
        ) : reservationsFiltrees.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#888',
              padding: '60px 20px',
              background: '#1A1A1A',
              borderRadius: '16px',
              border: '1px solid #2A2A2A',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                marginBottom: '12px',
              }}
            >
              📋
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Aucune réservation ici
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
            {reservationsFiltrees.map((r) => {
              const promo = r.promotions
              const info = statutInfo(r)

              const isVideo =
                promo?.media_type === 'video' ||
                promo?.photo_url?.includes('.mp4')

              const vendeurAccepte =
                r.vendeur_decision === 'acceptee'

              const peutPayerSolde =
                r.statut === 'acompte_paye' &&
                vendeurAccepte &&
                !r.paiement_complet &&
                Number(r.montant_restant) > 0

              const peutConfirmerReception =
                ['livree', 'inspection'].includes(
                  r.statut
                )

              return (
                <div
                  key={r.id}
                  style={{
                    background: '#1A1A1A',
                    borderRadius: '16px',
                    border: '1px solid #2A2A2A',
                    overflow: 'hidden',
                  }}
                >
                  {/* HEADER CARD */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderBottom: '1px solid #222',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        background: '#252525',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {promo?.photo_url ? (
                        isVideo ? (
                          <video
                            src={promo.photo_url}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <img
                            src={promo.photo_url}
                            alt={promo.titre}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        )
                      ) : (
                        <span
                          style={{
                            fontSize: '22px',
                          }}
                        >
                          🏷️
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          marginBottom: '3px',
                        }}
                      >
                        {promo?.titre ||
                          'Promotion supprimée'}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#888',
                        }}
                      >
                        🏪{' '}
                        {promo?.profiles?.nom ||
                          'Vendeur'}
                      </div>

                      {promo?.profiles?.adresse && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#555',
                            marginTop: '2px',
                          }}
                        >
                          📍{' '}
                          {promo.profiles.adresse}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: info.bg,
                        color: info.color,
                        flexShrink: 0,
                      }}
                    >
                      {info.label}
                    </div>
                  </div>

                  {/* FINANCES */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #222',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: '#888' }}>
                        Prix total
                      </span>

                      <span style={{ fontWeight: '700' }}>
                        {formatMoney(
                          r.montant_total ||
                            promo?.prix_promo
                        )}{' '}
                        FCFA
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: '#888' }}>
                        Acompte bloqué
                      </span>

                      <span
                        style={{
                          color: '#00C48C',
                          fontWeight: '700',
                        }}
                      >
                        {formatMoney(
                          r.montant_acompte
                        )}{' '}
                        FCFA
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: '#888' }}>
                        Reste à payer
                      </span>

                      <span
                        style={{
                          fontWeight: '700',
                        }}
                      >
                        {formatMoney(
                          r.montant_restant
                        )}{' '}
                        FCFA
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: '#888' }}>
                        Expiration
                      </span>

                      <span
                        style={{
                          color: '#FF5C00',
                          fontWeight: '600',
                        }}
                      >
                        {formatDate(
                          r.date_limite_solde ||
                            r.date_expiration
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ÉTAT VENDEUR */}
                  {r.statut === 'acompte_paye' &&
                    !vendeurAccepte &&
                    r.vendeur_decision !==
                      'refusee' && (
                      <div
                        style={{
                          margin: '12px 16px 0',
                          padding: '11px 12px',
                          background:
                            'rgba(255,184,0,0.08)',
                          border:
                            '1px solid rgba(255,184,0,0.25)',
                          borderRadius: '10px',
                          color: '#FFB800',
                          fontSize: '12px',
                        }}
                      >
                        ⏳ Le vendeur doit encore
                        accepter la réservation.
                      </div>
                    )}

                  {r.vendeur_decision ===
                    'refusee' && (
                    <div
                      style={{
                        margin: '12px 16px 0',
                        padding: '11px 12px',
                        background:
                          'rgba(255,60,60,0.08)',
                        border:
                          '1px solid rgba(255,60,60,0.25)',
                        borderRadius: '10px',
                        color: '#FF3C3C',
                        fontSize: '12px',
                      }}
                    >
                      ❌ Le vendeur a refusé cette
                      réservation. Le moteur financier
                      gère le remboursement des fonds
                      bloqués.
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {peutPayerSolde && (
                      <button
                        onClick={() =>
                          handlePaiementSolde(r)
                        }
                        disabled={
                          processing !== null
                        }
                        style={{
                          flex: 1,
                          minWidth: '220px',
                          padding: '11px',
                          background:
                            processing
                              ? '#333'
                              : '#FF5C00',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: processing
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        {processing ===
                        'pay_reservation_balance'
                          ? 'Paiement...'
                          : `💳 Payer le solde — ${formatMoney(
                              r.montant_restant
                            )} FCFA`}
                      </button>
                    )}

                    {r.statut ===
                      'expedition_en_attente' && (
                      <div
                        style={{
                          flex: 1,
                          padding: '11px',
                          background:
                            'rgba(255,184,0,0.08)',
                          border:
                            '1px solid rgba(255,184,0,0.2)',
                          borderRadius: '10px',
                          color: '#FFB800',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      >
                        📦 Le vendeur doit expédier
                        l’article sous 48 h.
                      </div>
                    )}

                    {r.statut === 'expediee' && (
                      <div
                        style={{
                          flex: 1,
                          padding: '11px',
                          background:
                            'rgba(77,166,255,0.08)',
                          border:
                            '1px solid rgba(77,166,255,0.2)',
                          borderRadius: '10px',
                          color: '#4DA6FF',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      >
                        🚚 Article expédié.
                        Attends la livraison.
                      </div>
                    )}

                    {r.statut === 'livree' && (
                      <div
                        style={{
                          flex: 1,
                          padding: '11px',
                          background:
                            'rgba(255,184,0,0.08)',
                          border:
                            '1px solid rgba(255,184,0,0.2)',
                          borderRadius: '10px',
                          color: '#FFB800',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                        }}
                      >
                        🔎 Article livré. Vérifie
                        maintenant son état.
                      </div>
                    )}

                    {peutConfirmerReception && (
                      <button
                        onClick={() =>
                          handleConfirmationReception(
                            r
                          )
                        }
                        disabled={
                          processing !== null
                        }
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          padding: '11px',
                          background:
                            processing
                              ? '#333'
                              : 'rgba(0,196,140,0.15)',
                          border:
                            '1px solid #00C48C',
                          borderRadius: '10px',
                          color: '#00C48C',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: processing
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        {processing ===
                        'confirm_reservation_reception'
                          ? 'Confirmation...'
                          : '✅ Article reçu et conforme'}
                      </button>
                    )}

                    {[
                      'acompte_paye',
                      'solde_paye',
                      'expedition_en_attente',
                      'expediee',
                      'livree',
                      'inspection',
                    ].includes(r.statut) && (
                      <button
                        onClick={() =>
                          handleOuvertureLitige(r)
                        }
                        disabled={
                          processing !== null
                        }
                        style={{
                          padding: '11px 14px',
                          background:
                            'rgba(255,92,0,0.08)',
                          border:
                            '1px solid rgba(255,92,0,0.35)',
                          borderRadius: '10px',
                          color: '#FF5C00',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: processing
                            ? 'not-allowed'
                            : 'pointer',
                        }}
                      >
                        ⚠️ Ouvrir un litige
                      </button>
                    )}

                    {r.statut === 'terminee' && (
                      <button
                        onClick={() =>
                          router.push(
                            `/avis?reservation=${r.id}&vendeur=${promo?.vendeur_id}`
                          )
                        }
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#FF5C00',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        ⭐ Laisser un avis
                      </button>
                    )}

                    <button
                      onClick={() =>
                        router.push(
                          `/chat/${promo?.vendeur_id}?promo=${r.promotion_id}`
                        )
                      }
                      style={{
                        padding: '10px 16px',
                        background: '#252525',
                        border: '1px solid #333',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      💬
                    </button>
                  </div>

                  {/* INFORMATIONS */}
                  <div
                    style={{
                      padding: '0 16px 14px',
                      color: '#555',
                      fontSize: '10px',
                    }}
                  >
                    Réservation créée le{' '}
                    {formatDateTime(r.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}