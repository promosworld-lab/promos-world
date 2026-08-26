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
    if (id) {
      initPage()
    }
  }, [id])

  // =========================================================
  // INITIALISATION
  // =========================================================

  const initPage = async () => {
    setLoading(true)
    setMessage('')

    try {
      // -----------------------------------------------------
      // UTILISATEUR
      // -----------------------------------------------------

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authData?.user) {
        router.push('/auth')
        return
      }

      setUser(authData.user)

      // -----------------------------------------------------
      // PROMOTION
      // -----------------------------------------------------

      const {
        data: promoData,
        error: promoError,
      } = await supabase
        .from('promotions')
        .select(`
          *,
          profiles (
            nom,
            adresse
          )
        `)
        .eq('id', id)
        .single()

      if (promoError || !promoData) {
        console.error(
          'Erreur promotion:',
          promoError
        )

        setMessage(
          'Impossible de charger cette promotion.'
        )

        setLoading(false)
        return
      }

      setPromo(promoData)

      // -----------------------------------------------------
      // WALLET
      // -----------------------------------------------------

      const {
        data: walletData,
        error: walletError,
      } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (walletError || !walletData) {
        console.error(
          'Erreur wallet:',
          walletError
        )

        setMessage(
          'Impossible de récupérer ton portefeuille.'
        )

        setLoading(false)
        return
      }

      setWallet(walletData)

      // -----------------------------------------------------
      // VÉRIFIER S'IL EXISTE DÉJÀ UNE RÉSERVATION
      // -----------------------------------------------------

      const {
        data: existingReservation,
        error: existingError,
      } = await supabase
        .from('reservations')
        .select('*')
        .eq('promotion_id', id)
        .eq('client_id', authData.user.id)
        .not(
          'statut',
          'in',
          '("annulee","expiree")'
        )
        .maybeSingle()

      if (!existingError && existingReservation) {
        setReservation(existingReservation)
      }
    } catch (error) {
      console.error(
        'Erreur initialisation:',
        error
      )

      setMessage(
        'Une erreur est survenue lors du chargement.'
      )
    }

    setLoading(false)
  }

  // =========================================================
  // RAFRAÎCHIR WALLET
  // =========================================================

  const refreshWallet = async () => {
    if (!user) return

    const {
      data,
      error,
    } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setWallet(data)
    }
  }

  // =========================================================
  // FORMAT MONNAIE
  // =========================================================

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (value) => {
    if (!value) return '—'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return '—'
    }

    return date.toLocaleDateString(
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

  // =========================================================
  // CONTINUER
  // =========================================================

  const handleContinue = () => {
    setMessage('')

    if (!promo) {
      setMessage(
        'Promotion introuvable.'
      )
      return
    }

    if (promo.statut !== 'actif') {
      setMessage(
        'Cette promotion n’est plus active.'
      )
      return
    }

    if (Number(promo.stock) <= 0) {
      setMessage(
        'Stock épuisé.'
      )
      return
    }

    if (!wallet) {
      setMessage(
        'Portefeuille introuvable.'
      )
      return
    }

    // 20 % du prix total
    const acompte = Math.round(
      Number(promo.prix_promo) * 0.2
    )

    const soldeDisponible = Number(
      wallet.solde_disponible || 0
    )

    if (soldeDisponible < acompte) {
      setMessage(
        `Solde insuffisant. Il faut ${formatMoney(
          acompte
        )} FCFA pour réserver. Ton solde disponible est de ${formatMoney(
          soldeDisponible
        )} FCFA.`
      )

      setMessageType('error')

      return
    }

    setEtape(2)
  }

  // =========================================================
  // CRÉER LA RÉSERVATION
  // =========================================================

  const handleReserver = async () => {
    if (
      !user ||
      !promo ||
      processing
    ) {
      return
    }

    setProcessing(true)
    setMessage('')

    try {
      // -----------------------------------------------------
      // RPC FINANCIÈRE
      // -----------------------------------------------------

      const {
        data,
        error,
      } = await supabase.rpc(
        'create_reservation_from_wallet',
        {
          p_promotion_id: promo.id,
        }
      )

      if (error) {
        console.error(
          'Erreur réservation:',
          error
        )

        setMessage(
          error.message ||
            'Impossible de créer la réservation.'
        )

        setMessageType('error')

        await refreshWallet()

        setProcessing(false)

        return
      }

      if (!data?.success) {
        setMessage(
          data?.message ||
            'La réservation n’a pas pu être effectuée.'
        )

        setMessageType('error')

        setProcessing(false)

        return
      }

      // -----------------------------------------------------
      // RÉCUPÉRER LA RÉSERVATION CRÉÉE
      // -----------------------------------------------------

      const {
        data: reservationData,
        error: reservationError,
      } = await supabase
        .from('reservations')
        .select('*')
        .eq(
          'id',
          data.reservation_id
        )
        .single()

      if (reservationError) {
        console.error(
          'Erreur récupération réservation:',
          reservationError
        )
      }

      // -----------------------------------------------------
      // METTRE À JOUR LE WALLET LOCAL
      // -----------------------------------------------------

      await refreshWallet()

      if (reservationData) {
        setReservation(
          reservationData
        )
      } else {
        setReservation({
          id: data.reservation_id,
          date_expiration:
            data.date_expiration ||
            null,
          date_limite_acceptation:
            data.date_limite_acceptation ||
            null,
          statut:
            data.statut ||
            'acompte_paye',
        })
      }

      setMessageType('success')

      setMessage(
        'Réservation effectuée avec succès.'
      )

      setEtape(3)
    } catch (error) {
      console.error(
        'Erreur inattendue réservation:',
        error
      )

      setMessage(
        'Une erreur inattendue est survenue.'
      )

      setMessageType('error')
    }

    setProcessing(false)
  }

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // PROMOTION INTROUVABLE
  // =========================================================

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

  // =========================================================
  // CALCULS
  // =========================================================

  const prixTotal = Number(
    promo.prix_promo || 0
  )

  const acompte = Math.round(
    prixTotal * 0.2
  )

  const restant =
    prixTotal - acompte

  const soldeDisponible = Number(
    wallet?.solde_disponible || 0
  )

  const soldeSuffisant =
    soldeDisponible >= acompte

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

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
          onClick={() =>
            etape === 1
              ? router.back()
              : setEtape(
                  etape - 1
                )
          }
          style={{
            width: '36px',
            height: '36px',
            background: '#1A1A1A',
            border:
              '1px solid #2A2A2A',
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
            ? 'Réservation créée'
            : 'Réservation'}
        </div>
      </div>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding:
            '80px 20px 40px',
        }}
      >
        {/* =================================================
            STEPS
        ================================================= */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '28px',
          }}
        >
          {[1, 2, 3].map(
            (s, i) => (
              <Fragment key={s}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
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
            )
          )}
        </div>

        {/* =================================================
            PROMOTION
        ================================================= */}

        <div
          style={{
            background: '#1A1A1A',
            borderRadius: '16px',
            padding: '16px',
            border:
              '1px solid #2A2A2A',
            marginBottom: '20px',
            display: 'flex',
            alignItems:
              'center',
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
              alignItems:
                'center',
              justifyContent:
                'center',
              fontSize: '24px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {promo.photo_url ? (
              promo.media_type ===
                'video' ||
              promo.photo_url.includes(
                '.mp4'
              ) ? (
                <video
                  src={
                    promo.photo_url
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit:
                      'cover',
                  }}
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={
                    promo.photo_url
                  }
                  alt={promo.titre}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit:
                      'cover',
                  }}
                />
              )
            ) : (
              '🏷️'
            )}
          </div>

          <div
            style={{
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
              {promo.titre}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#888',
              }}
            >
              {promo.profiles?.nom ||
                'Vendeur'}
              {' · '}
              {promo.profiles
                ?.adresse ||
                'Adresse non précisée'}
            </div>
          </div>
        </div>

        {/* =================================================
            ÉTAPE 1
        ================================================= */}

        {etape === 1 && (
          <>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                marginBottom: '12px',
              }}
            >
              💰 Paiement par
              portefeuille
            </div>

            {/* WALLET */}

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
                {formatMoney(
                  soldeDisponible
                )}{' '}
                FCFA
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color:
                    soldeSuffisant
                      ? '#6EE7A0'
                      : '#FF8A8A',
                  fontWeight: '700',
                }}
              >
                {soldeSuffisant
                  ? '✓ Ton solde couvre l’acompte.'
                  : `✕ Il manque ${formatMoney(
                      acompte -
                        soldeDisponible
                    )} FCFA.`}
              </div>
            </div>

            {/* RÉCAP FINANCIER */}

            <div
              style={{
                background: '#1A1A1A',
                borderRadius: '14px',
                padding: '14px',
                border:
                  '1px solid #2A2A2A',
                marginBottom: '20px',
              }}
            >
              {[
                {
                  label:
                    'Prix total',
                  value: `${formatMoney(
                    prixTotal
                  )} FCFA`,
                },
                {
                  label:
                    'Acompte à bloquer (20%)',
                  value: `${formatMoney(
                    acompte
                  )} FCFA`,
                  color:
                    '#FF5C00',
                },
                {
                  label:
                    'Reste à payer',
                  value: `${formatMoney(
                    restant
                  )} FCFA`,
                },
                {
                  label:
                    'Délai vendeur',
                  value:
                    '36 heures',
                },
                {
                  label:
                    'Validité réservation',
                  value:
                    '3 mois',
                },
              ].map(
                (
                  item,
                  i
                ) => (
                  <div
                    key={i}
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      marginBottom:
                        i < 4
                          ? '8px'
                          : '0',
                      fontSize:
                        '13px',
                      gap: '12px',
                    }}
                  >
                    <span
                      style={{
                        color:
                          '#888',
                      }}
                    >
                      {
                        item.label
                      }
                    </span>

                    <span
                      style={{
                        fontWeight:
                          '700',
                        color:
                          item.color ||
                          'white',
                        textAlign:
                          'right',
                      }}
                    >
                      {
                        item.value
                      }
                    </span>
                  </div>
                )
              )}
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
                Ton portefeuille
                contient{' '}
                <strong>
                  {formatMoney(
                    soldeDisponible
                  )}{' '}
                  FCFA
                </strong>
                , mais cette
                réservation
                nécessite{' '}
                <strong>
                  {formatMoney(
                    acompte
                  )}{' '}
                  FCFA
                </strong>
                .
                <br />
                Recharge ton
                portefeuille
                avant de
                continuer.
              </div>
            )}

            {message && (
              <div
                style={{
                  padding: '12px',
                  borderRadius:
                    '10px',
                  marginBottom:
                    '16px',
                  background:
                    messageType ===
                    'success'
                      ? 'rgba(0,196,140,0.1)'
                      : 'rgba(255,60,60,0.1)',
                  border:
                    messageType ===
                    'success'
                      ? '1px solid #00C48C'
                      : '1px solid #FF3C3C',
                  color:
                    messageType ===
                    'success'
                      ? '#00C48C'
                      : '#FF8A8A',
                  fontSize:
                    '13px',
                }}
              >
                {message}
              </div>
            )}

            <button
              onClick={
                handleContinue
              }
              disabled={
                !soldeSuffisant
              }
              style={{
                width: '100%',
                padding: '15px',
                background:
                  soldeSuffisant
                    ? '#FF5C00'
                    : '#333',
                border: 'none',
                borderRadius:
                  '14px',
                color:
                  soldeSuffisant
                    ? 'white'
                    : '#777',
                fontWeight:
                  '700',
                fontSize:
                  '14px',
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
                  router.push(
                    '/wallet'
                  )
                }
                style={{
                  width: '100%',
                  padding: '13px',
                  background:
                    'transparent',
                  border:
                    '1px solid #2A2A2A',
                  borderRadius:
                    '14px',
                  color:
                    'white',
                  fontSize:
                    '13px',
                  cursor:
                    'pointer',
                  marginTop:
                    '10px',
                }}
              >
                💰 Aller au
                portefeuille
              </button>
            )}
          </>
        )}

        {/* =================================================
            ÉTAPE 2
        ================================================= */}

        {etape === 2 && (
          <>
            <div
              style={{
                background: '#1A1A1A',
                borderRadius: '16px',
                padding: '20px',
                border:
                  '1px solid #2A2A2A',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  marginBottom:
                    '16px',
                }}
              >
                Vérification
                avant réservation
              </div>

              {[
                {
                  label:
                    'Article',
                  value:
                    promo.titre,
                },
                {
                  label:
                    'Vendeur',
                  value:
                    promo.profiles
                      ?.nom ||
                    'Vendeur',
                },
                {
                  label:
                    'Prix total',
                  value: `${formatMoney(
                    prixTotal
                  )} FCFA`,
                },
                {
                  label:
                    'Acompte',
                  value: `${formatMoney(
                    acompte
                  )} FCFA`,
                },
                {
                  label:
                    'Reste à payer',
                  value: `${formatMoney(
                    restant
                  )} FCFA`,
                },
                {
                  label:
                    'Paiement',
                  value:
                    'Portefeuille Promo’s World',
                },
                {
                  label:
                    'Validité',
                  value:
                    '3 mois',
                },
              ].map(
                (
                  item,
                  i
                ) => (
                  <div
                    key={i}
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      marginBottom:
                        '10px',
                      fontSize:
                        '13px',
                      gap: '12px',
                    }}
                  >
                    <span
                      style={{
                        color:
                          '#888',
                      }}
                    >
                      {
                        item.label
                      }
                    </span>

                    <span
                      style={{
                        fontWeight:
                          '600',
                        maxWidth:
                          '60%',
                        textAlign:
                          'right',
                      }}
                    >
                      {
                        item.value
                      }
                    </span>
                  </div>
                )
              )}
            </div>

            {/* INFORMATION PROCESSUS */}

            <div
              style={{
                background:
                  'rgba(255,92,0,0.08)',
                borderRadius:
                  '12px',
                padding:
                  '13px 14px',
                border:
                  '1px solid rgba(255,92,0,0.2)',
                fontSize: '12px',
                color: '#aaa',
                marginBottom:
                  '12px',
                lineHeight:
                  '1.6',
              }}
            >
              <strong
                style={{
                  color:
                    '#FF5C00',
                }}
              >
                Après confirmation :
              </strong>
              <br />
              • Ton acompte de{' '}
              <strong
                style={{
                  color:
                    'white',
                }}
              >
                {formatMoney(
                  acompte
                )}{' '}
                FCFA
              </strong>{' '}
              sera bloqué.
              <br />
              • Le vendeur aura
              <strong
                style={{
                  color:
                    'white',
                }}
              >
                {' '}
                36 heures
              </strong>{' '}
              pour accepter ou
              refuser.
              <br />
              • Si le vendeur
              accepte, tu pourras
              payer le solde depuis
              ta réservation.
              <br />
              • Le solde devra être
              payé avant la suite du
              processus d'expédition.
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                style={{
                  padding: '12px',
                  borderRadius:
                    '10px',
                  marginBottom:
                    '16px',
                  background:
                    'rgba(255,60,60,0.1)',
                  border:
                    '1px solid #FF3C3C',
                  color:
                    '#FF8A8A',
                  fontSize:
                    '13px',
                }}
              >
                {message}
              </div>
            )}

            {/* CONFIRMATION */}

            <button
              onClick={
                handleReserver
              }
              disabled={
                processing
              }
              style={{
                width: '100%',
                padding: '15px',
                background:
                  processing
                    ? '#333'
                    : '#FF5C00',
                border: 'none',
                borderRadius:
                  '14px',
                color: 'white',
                fontWeight:
                  '700',
                fontSize:
                  '14px',
                cursor:
                  processing
                    ? 'not-allowed'
                    : 'pointer',
                marginBottom:
                  '10px',
              }}
            >
              {processing
                ? 'Traitement...'
                : `Confirmer — bloquer ${formatMoney(
                    acompte
                  )} FCFA`}
            </button>

            <button
              onClick={() =>
                setEtape(1)
              }
              disabled={
                processing
              }
              style={{
                width: '100%',
                padding: '13px',
                background:
                  'transparent',
                border:
                  '1px solid #2A2A2A',
                borderRadius:
                  '14px',
                color: '#888',
                fontSize:
                  '13px',
                cursor:
                  processing
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              ← Modifier
            </button>
          </>
        )}

        {/* =================================================
            ÉTAPE 3
        ================================================= */}

        {etape === 3 &&
          reservation && (
            <>
              <div
                style={{
                  textAlign:
                    'center',
                  padding:
                    '20px 0 28px',
                }}
              >
                <div
                  style={{
                    fontSize:
                      '60px',
                    marginBottom:
                      '16px',
                  }}
                >
                  🎉
                </div>

                <div
                  style={{
                    fontSize:
                      '20px',
                    fontWeight:
                      '800',
                    marginBottom:
                      '8px',
                  }}
                >
                  Réservation
                  créée !
                </div>

                <div
                  style={{
                    fontSize:
                      '13px',
                    color:
                      '#888',
                    lineHeight:
                      '1.6',
                  }}
                >
                  Ton acompte de{' '}
                  <strong
                    style={{
                      color:
                        '#FF5C00',
                    }}
                  >
                    {formatMoney(
                      acompte
                    )}{' '}
                    FCFA
                  </strong>{' '}
                  a été bloqué
                  dans ton
                  portefeuille.
                </div>
              </div>

              {/* STATUT */}

              <div
                style={{
                  background:
                    '#1A1A1A',
                  borderRadius:
                    '16px',
                  border:
                    '1px solid #2A2A2A',
                  overflow:
                    'hidden',
                  marginBottom:
                    '16px',
                }}
              >
                <div
                  style={{
                    padding:
                      '16px',
                    borderBottom:
                      '1px solid #222',
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        '11px',
                      color:
                        '#888',
                      marginBottom:
                        '4px',
                    }}
                  >
                    STATUT
                  </div>

                  <div
                    style={{
                      display:
                        'inline-block',
                      background:
                        'rgba(255,92,0,0.12)',
                      color:
                        '#FF8A5C',
                      borderRadius:
                        '999px',
                      padding:
                        '7px 12px',
                      fontSize:
                        '12px',
                      fontWeight:
                        '700',
                    }}
                  >
                    {reservation.statut ===
                    'acompte_paye'
                      ? '⏳ En attente du vendeur'
                      : reservation.statut ||
                        'En attente'}
                  </div>
                </div>

                <div
                  style={{
                    padding:
                      '16px',
                  }}
                >
                  {[
                    {
                      label:
                        'Article',
                      value:
                        promo.titre,
                    },
                    {
                      label:
                        'Vendeur',
                      value:
                        promo
                          .profiles
                          ?.nom ||
                        'Vendeur',
                    },
                    {
                      label:
                        'Acompte bloqué',
                      value: `${formatMoney(
                        acompte
                      )} FCFA`,
                      color:
                        '#00C48C',
                    },
                    {
                      label:
                        'Reste à payer',
                      value: `${formatMoney(
                        restant
                      )} FCFA`,
                    },
                    {
                      label:
                        'Décision vendeur avant',
                      value:
                        formatDate(
                          reservation.date_limite_acceptation
                        ),
                      color:
                        '#FF5C00',
                    },
                    {
                      label:
                        'Expiration réservation',
                      value:
                        formatDate(
                          reservation.date_limite_solde ||
                            reservation.date_expiration
                        ),
                      color:
                        '#FF5C00',
                    },
                  ].map(
                    (
                      item,
                      i
                    ) => (
                      <div
                        key={i}
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          marginBottom:
                            i <
                            5
                              ? '9px'
                              : '0',
                          fontSize:
                            '13px',
                          gap: '12px',
                        }}
                      >
                        <span
                          style={{
                            color:
                              '#888',
                          }}
                        >
                          {
                            item.label
                          }
                        </span>

                        <span
                          style={{
                            fontWeight:
                              '700',
                            color:
                              item.color ||
                              'white',
                            textAlign:
                              'right',
                            maxWidth:
                              '60%',
                          }}
                        >
                          {
                            item.value
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* EXPLICATION */}

              <div
                style={{
                  background:
                    'rgba(0,196,140,0.08)',
                  borderRadius:
                    '12px',
                  padding:
                    '13px 14px',
                  border:
                    '1px solid rgba(0,196,140,0.2)',
                  fontSize:
                    '12px',
                  color:
                    '#999',
                  marginBottom:
                    '20px',
                  lineHeight:
                    '1.6',
                }}
              >
                🔒 Ton acompte reste
                protégé dans les fonds
                bloqués.

                <br />
                <br />

                Le vendeur doit maintenant
                accepter ou refuser ta
                réservation dans le délai
                prévu.

                <br />
                <br />

                Tu n'as rien d'autre à
                payer pour le moment.
                Si le vendeur accepte,
                tu pourras ensuite payer
                le solde depuis ta page
                de réservation.
              </div>

              {/* RÉSERVATIONS */}

              <button
                onClick={() =>
                  router.push(
                    '/reservations'
                  )
                }
                style={{
                  width: '100%',
                  padding:
                    '14px',
                  background:
                    '#FF5C00',
                  border: 'none',
                  borderRadius:
                    '14px',
                  color: 'white',
                  fontWeight:
                    '700',
                  fontSize:
                    '14px',
                  cursor:
                    'pointer',
                  marginBottom:
                    '10px',
                }}
              >
                Voir mes
                réservations
              </button>

              {/* CHAT */}

              <button
                onClick={() =>
                  router.push(
                    `/chat/${promo.vendeur_id}?promo=${id}`
                  )
                }
                style={{
                  width: '100%',
                  padding:
                    '13px',
                  background:
                    '#1A1A1A',
                  border:
                    '1px solid #2A2A2A',
                  borderRadius:
                    '14px',
                  color:
                    'white',
                  fontSize:
                    '13px',
                  cursor:
                    'pointer',
                }}
              >
                💬 Contacter le
                vendeur
              </button>
            </>
          )}
      </div>
    </div>
  )
}