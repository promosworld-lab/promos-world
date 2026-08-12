'use client'

import { useState, useEffect, Fragment } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Reserver() {
  const router = useRouter()
  const { id } = useParams()

  const [promo, setPromo] = useState(null)
  const [user, setUser] = useState(null)
  const [wallet, setWallet] = useState(null)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [etape, setEtape] = useState(1)
  const [reservation, setReservation] = useState(null)

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('error')

  useEffect(() => {
    initPage()
  }, [id])

  const initPage = async () => {
    setLoading(true)
    setMessage('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      router.push('/auth')
      return
    }

    setUser(authData.user)

    const { data: promoData, error: promoError } = await supabase
      .from('promotions')
      .select('*, profiles(nom, adresse)')
      .eq('id', id)
      .single()

    if (promoError) {
      console.error('Erreur promotion:', promoError)
      setMessage('Impossible de charger cette promotion.')
      setLoading(false)
      return
    }

    setPromo(promoData)

    const { data: walletData, error: walletError } =
      await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

    if (walletError) {
      console.error('Erreur wallet:', walletError)

      setMessage(
        'Impossible de récupérer ton portefeuille.'
      )

      setLoading(false)
      return
    }

    setWallet(walletData)

    setLoading(false)
  }

  const refreshWallet = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setWallet(data)
    }
  }

  const handleContinue = () => {
    setMessage('')

    if (!promo) return

    if (promo.statut !== 'actif') {
      setMessage('Cette promotion n’est pas active.')
      return
    }

    if (Number(promo.stock) <= 0) {
      setMessage('Stock épuisé.')
      return
    }

    if (!wallet) {
      setMessage('Portefeuille introuvable.')
      return
    }

    const acompte = Math.round(Number(promo.prix_promo) * 0.2)

    if (Number(wallet.solde_disponible) < acompte) {
      setMessage(
        `Solde insuffisant. Il faut ${formatMoney(acompte)} FCFA pour réserver, mais ton solde est de ${formatMoney(wallet.solde_disponible)} FCFA.`
      )
      return
    }

    setEtape(2)
  }

  const handleReserver = async () => {
    if (!user || !promo || processing) return

    setProcessing(true)
    setMessage('')

    const { data, error } = await supabase.rpc(
      'create_reservation_from_wallet',
      {
        p_promotion_id: promo.id,
      }
    )

    if (error) {
      console.error('Erreur réservation:', error)

      setMessage(error.message)
      setMessageType('error')

      await refreshWallet()

      setProcessing(false)
      return
    }

    if (!data?.success) {
      setMessage(
        'La réservation n’a pas pu être effectuée.'
      )

      setProcessing(false)
      return
    }

    const { data: reservationData, error: reservationError } =
      await supabase
        .from('reservations')
        .select('*')
        .eq('id', data.reservation_id)
        .single()

    if (reservationError) {
      console.error(
        'Erreur récupération réservation:',
        reservationError
      )
    }

    setReservation(
      reservationData || {
        id: data.reservation_id,
        date_expiration: data.date_expiration,
      }
    )

    setWallet((current) => ({
      ...current,
      solde_disponible: data.solde_apres,
      solde_bloque: data.fonds_bloques,
    }))

    setMessageType('success')
    setMessage('Réservation effectuée avec succès.')

    setEtape(3)
    setProcessing(false)
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontFamily: 'sans-serif',
        }}
      >
        Chargement...
      </div>
    )
  }

  if (!promo) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontFamily: 'sans-serif',
        }}
      >
        Promotion introuvable.
      </div>
    )
  }

  const acompte = Math.round(Number(promo.prix_promo) * 0.2)
  const restant = Number(promo.prix_promo) - acompte

  const soldeDisponible = Number(
    wallet?.solde_disponible || 0
  )

  const soldeSuffisant = soldeDisponible >= acompte

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
          onClick={() =>
            etape === 1
              ? router.back()
              : setEtape(etape - 1)
          }
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
            fontSize: '16px',
            fontWeight: '700',
          }}
        >
          {etape === 3
            ? 'Réservation confirmée'
            : 'Réservation'}
        </div>
      </div>

      {/* CONTENT */}

      <div
        style={{
          paddingTop: '70px',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '80px 20px 40px',
        }}
      >
        {/* STEPS */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          {[1, 2, 3].map((s, i) => (
            <Fragment key={s}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  background:
                    etape >= s
                      ? '#FF5C00'
                      : '#1A1A1A',
                  border:
                    etape >= s
                      ? 'none'
                      : '1px solid #333',
                  color:
                    etape >= s
                      ? 'white'
                      : '#888',
                  flexShrink: 0,
                }}
              >
                {s}
              </div>

              {i < 2 && (
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background:
                      etape > s
                        ? '#FF5C00'
                        : '#333',
                  }}
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* PROMOTION */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #2A2A2A',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#252525',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              overflow: 'hidden',
            }}
          >
            {promo.photo_url ? (
              promo.media_type === 'video' ||
              promo.photo_url.includes('.mp4') ? (
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
              '🏷️'
            )}
          </div>

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '3px',
              }}
            >
              {promo.titre}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#888',
              }}
            >
              {promo.profiles?.nom} ·{' '}
              {promo.profiles?.adresse ||
                'Adresse non précisée'}
            </div>
          </div>
        </div>

        {/* ÉTAPE 1 */}

        {etape === 1 && (
          <>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                marginBottom: '12px',
              }}
            >
              💰 Paiement par portefeuille
            </div>

            <div
              style={{
                background:
                  soldeSuffisant
                    ? '#102A18'
                    : '#2A1111',
                border:
                  soldeSuffisant
                    ? '1px solid #1F6B38'
                    : '1px solid #6B2020',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginBottom: '6px',
                }}
              >
                Solde disponible
              </div>

              <div
                style={{
                  fontSize: '26px',
                  fontWeight: '900',
                  marginBottom: '10px',
                }}
              >
                {formatMoney(soldeDisponible)} FCFA
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: soldeSuffisant
                    ? '#6EE7A0'
                    : '#FF8A8A',
                  fontWeight: '700',
                }}
              >
                {soldeSuffisant
                  ? '✓ Ton solde couvre l’acompte.'
                  : `✕ Il manque ${formatMoney(
                      acompte - soldeDisponible
                    )} FCFA.`}
              </div>
            </div>

            <div
              style={{
                background: '#1A1A1A',
                borderRadius: '14px',
                padding: '14px',
                border: '1px solid #2A2A2A',
                marginBottom: '20px',
              }}
            >
              {[
                {
                  label: 'Prix total',
                  value: `${formatMoney(
                    promo.prix_promo
                  )} FCFA`,
                },
                {
                  label: 'Acompte à bloquer (20%)',
                  value: `${formatMoney(
                    acompte
                  )} FCFA`,
                  color: '#FF5C00',
                },
                {
                  label: 'Reste à payer plus tard',
                  value: `${formatMoney(
                    restant
                  )} FCFA`,
                },
                {
                  label: 'Validité',
                  value: '3 mois',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    marginBottom:
                      i < 3 ? '8px' : '0',
                    fontSize: '13px',
                  }}
                >
                  <span
                    style={{
                      color: '#888',
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontWeight: '700',
                      color:
                        item.color || 'white',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {!soldeSuffisant && (
              <div
                style={{
                  background:
                    'rgba(255,60,60,0.08)',
                  border:
                    '1px solid rgba(255,60,60,0.25)',
                  borderRadius: '12px',
                  padding: '13px',
                  marginBottom: '16px',
                  fontSize: '12px',
                  color: '#FF8A8A',
                  lineHeight: '1.5',
                }}
              >
                Ton portefeuille contient{' '}
                <strong>
                  {formatMoney(
                    soldeDisponible
                  )}{' '}
                  FCFA
                </strong>
                , mais cette réservation
                nécessite{' '}
                <strong>
                  {formatMoney(acompte)} FCFA
                </strong>
                .
                <br />
                Tu dois d’abord recharger ton
                portefeuille.
              </div>
            )}

            {message && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  background:
                    messageType === 'success'
                      ? 'rgba(0,196,140,0.1)'
                      : 'rgba(255,60,60,0.1)',
                  border:
                    messageType === 'success'
                      ? '1px solid #00C48C'
                      : '1px solid #FF3C3C',
                  color:
                    messageType === 'success'
                      ? '#00C48C'
                      : '#FF8A8A',
                  fontSize: '13px',
                }}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!soldeSuffisant}
              style={{
                width: '100%',
                padding: '15px',
                background:
                  soldeSuffisant
                    ? '#FF5C00'
                    : '#333',
                border: 'none',
                borderRadius: '14px',
                color:
                  soldeSuffisant
                    ? 'white'
                    : '#777',
                fontWeight: '700',
                fontSize: '14px',
                cursor:
                  soldeSuffisant
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              {soldeSuffisant
                ? 'Continuer →'
                : 'Solde insuffisant'}
            </button>

            {!soldeSuffisant && (
              <button
                onClick={() =>
                  router.push('/wallet')
                }
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'transparent',
                  border:
                    '1px solid #2A2A2A',
                  borderRadius: '14px',
                  color: 'white',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                💰 Aller au portefeuille
              </button>
            )}
          </>
        )}

        {/* ÉTAPE 2 */}

        {etape === 2 && (
          <>
            <div
              style={{
                background: '#1A1A1A',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #2A2A2A',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom: '16px',
                }}
              >
                Récapitulatif
              </div>

              {[
                {
                  label: 'Article',
                  value: promo.titre,
                },
                {
                  label: 'Vendeur',
                  value:
                    promo.profiles?.nom,
                },
                {
                  label: 'Paiement',
                  value:
                    'Portefeuille Promo’s World',
                },
                {
                  label: 'Solde actuel',
                  value: `${formatMoney(
                    soldeDisponible
                  )} FCFA`,
                },
                {
                  label: 'Acompte à bloquer',
                  value: `${formatMoney(
                    acompte
                  )} FCFA`,
                },
                {
                  label: 'Reste à payer',
                  value: `${formatMoney(
                    restant
                  )} FCFA`,
                },
                {
                  label: 'Réservation valable',
                  value: '3 mois',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    marginBottom: '10px',
                    fontSize: '13px',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      color: '#888',
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontWeight: '600',
                      maxWidth: '55%',
                      textAlign: 'right',
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                background:
                  'rgba(0,196,140,0.08)',
                borderRadius: '12px',
                padding: '12px 14px',
                border:
                  '1px solid rgba(0,196,140,0.2)',
                fontSize: '12px',
                color: '#888',
                marginBottom: '20px',
                lineHeight: '1.6',
              }}
            >
              🔒 Ton acompte sera prélevé de ton
              portefeuille et placé dans les{' '}
              <strong style={{ color: '#00C48C' }}>
                fonds bloqués
              </strong>{' '}
              jusqu’à la finalisation de la
              réservation.
            </div>

            {message && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  background:
                    'rgba(255,60,60,0.1)',
                  border:
                    '1px solid #FF3C3C',
                  color: '#FF8A8A',
                  fontSize: '13px',
                }}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleReserver}
              disabled={processing}
              style={{
                width: '100%',
                padding: '15px',
                background: processing
                  ? '#333'
                  : '#FF5C00',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: processing
                  ? 'not-allowed'
                  : 'pointer',
                marginBottom: '10px',
              }}
            >
              {processing
                ? 'Traitement...'
                : `Confirmer la réservation — ${formatMoney(
                    acompte
                  )} FCFA`}
            </button>

            <button
              onClick={() => setEtape(1)}
              disabled={processing}
              style={{
                width: '100%',
                padding: '13px',
                background: 'transparent',
                border:
                  '1px solid #2A2A2A',
                borderRadius: '14px',
                color: '#888',
                fontSize: '13px',
                cursor: processing
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              Modifier
            </button>
          </>
        )}

        {/* ÉTAPE 3 */}

        {etape === 3 && reservation && (
          <>
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0 28px',
              }}
            >
              <div
                style={{
                  fontSize: '60px',
                  marginBottom: '16px',
                }}
              >
                🎉
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  marginBottom: '8px',
                }}
              >
                Réservation confirmée !
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#888',
                  lineHeight: '1.6',
                }}
              >
                Ton acompte de{' '}
                <strong
                  style={{
                    color: '#FF5C00',
                  }}
                >
                  {formatMoney(acompte)} FCFA
                </strong>{' '}
                a été prélevé de ton portefeuille
                et placé dans les fonds bloqués.
                <br />
                Tu as 3 mois pour finaliser
                l’achat.
              </div>
            </div>

            <div
              style={{
                background: '#1A1A1A',
                borderRadius: '16px',
                border:
                  '1px solid #2A2A2A',
                overflow: 'hidden',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  padding: '16px',
                  borderBottom:
                    '1px solid #222',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#888',
                    marginBottom: '4px',
                  }}
                >
                  ARTICLE
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {promo.titre}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#888',
                  }}
                >
                  {promo.profiles?.nom}
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                }}
              >
                {[
                  {
                    label: 'Acompte bloqué',
                    value: `✓ ${formatMoney(
                      acompte
                    )} FCFA`,
                    color: '#00C48C',
                  },
                  {
                    label: 'Nouveau solde disponible',
                    value: `${formatMoney(
                      wallet?.solde_disponible
                    )} FCFA`,
                  },
                  {
                    label: 'Fonds bloqués',
                    value: `${formatMoney(
                      wallet?.solde_bloque
                    )} FCFA`,
                    color: '#FF5C00',
                  },
                  {
                    label: 'Reste à payer',
                    value: `${formatMoney(
                      restant
                    )} FCFA`,
                  },
                  {
                    label: 'Valable jusqu’au',
                    value: new Date(
                      reservation.date_expiration
                    ).toLocaleDateString(
                      'fr-FR'
                    ),
                    color: '#FF5C00',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      marginBottom:
                        i < 4 ? '8px' : '0',
                      fontSize: '13px',
                    }}
                  >
                    <span
                      style={{
                        color: '#888',
                      }}
                    >
                      {item.label}
                    </span>

                    <span
                      style={{
                        fontWeight: '700',
                        color:
                          item.color ||
                          'white',
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                router.push('/reservations')
              }
              style={{
                width: '100%',
                padding: '14px',
                background: '#FF5C00',
                border: 'none',
                borderRadius: '14px',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
              Voir mes réservations
            </button>

            <button
              onClick={() =>
                router.push(
                  `/chat/${promo.vendeur_id}?promo=${id}`
                )
              }
              style={{
                width: '100%',
                padding: '13px',
                background: '#1A1A1A',
                border:
                  '1px solid #2A2A2A',
                borderRadius: '14px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              💬 Contacter le vendeur
            </button>
          </>
        )}
      </div>
    </div>
  )
}