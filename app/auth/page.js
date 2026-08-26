'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const router = useRouter()

  const [mode, setMode] = useState('login')

  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [role, setRole] = useState('client')

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()

    if (data?.user) {
      router.push('/')
      return
    }

    setLoading(false)
  }

  const resetMessages = () => {
    setMessage('')
    setError('')
  }

  const handleLogin = async () => {
    resetMessages()

    if (!email.trim() || !password) {
      setError('Entre ton adresse email et ton mot de passe.')
      return
    }

    setProcessing(true)

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    if (loginError) {
      setError(loginError.message)
      setProcessing(false)
      return
    }

    if (!data?.user) {
      setError('Connexion impossible.')
      setProcessing(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleRegister = async () => {
    resetMessages()

    if (!nom.trim()) {
      setError('Entre ton nom.')
      return
    }

    if (!email.trim()) {
      setError('Entre ton adresse email.')
      return
    }

    if (!password) {
      setError('Entre un mot de passe.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setProcessing(true)

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nom: nom.trim(),
            telephone: telephone.trim(),
            role,
          },
        },
      })

    if (signUpError) {
      setError(signUpError.message)
      setProcessing(false)
      return
    }

    /*
      Le trigger Supabase handle_new_user doit créer le profil
      automatiquement à partir des metadata envoyées ci-dessus.

      Si la confirmation email est activée dans Supabase,
      session sera null et l'utilisateur devra confirmer son email.
    */

    if (!data?.session) {
      setMessage(
        'Compte créé avec succès. Vérifie ton adresse email pour confirmer ton compte.'
      )
      setProcessing(false)
      return
    }

    setMessage('Compte créé avec succès. Bienvenue sur Promo’s World !')

    setTimeout(() => {
      router.push('/')
      router.refresh()
    }, 700)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (processing) return

    if (mode === 'login') {
      await handleLogin()
    } else {
      await handleRegister()
    }
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
        }}
      >
        {/* LOGO */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#FF5C00',
            }}
          >
            Promo's
            <span style={{ color: 'white' }}>World</span>
          </div>

          <div
            style={{
              color: '#777',
              fontSize: '12px',
              marginTop: '6px',
            }}
          >
            Marketplace de promotions en Afrique de l'Ouest
          </div>
        </div>

        {/* CARD */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '20px',
            padding: '22px',
          }}
        >
          {/* TABS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              background: '#111',
              padding: '5px',
              borderRadius: '12px',
              marginBottom: '24px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login')
                resetMessages()
              }}
              style={{
                padding: '11px',
                border: 'none',
                borderRadius: '9px',
                background:
                  mode === 'login' ? '#FF5C00' : 'transparent',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Connexion
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register')
                resetMessages()
              }}
              style={{
                padding: '11px',
                border: 'none',
                borderRadius: '9px',
                background:
                  mode === 'register' ? '#FF5C00' : 'transparent',
                color: 'white',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '7px',
                  }}
                >
                  Nom
                </label>

                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ton nom"
                  autoComplete="name"
                  style={inputStyle}
                />

                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '7px',
                  }}
                >
                  Téléphone
                  <span
                    style={{
                      color: '#666',
                      fontWeight: '400',
                    }}
                  >
                    {' '}
                    (facultatif)
                  </span>
                </label>

                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Ex : 97000000"
                  autoComplete="tel"
                  style={inputStyle}
                />

                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '7px',
                  }}
                >
                  Type de compte
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setRole('client')}
                    style={{
                      padding: '12px',
                      background:
                        role === 'client'
                          ? 'rgba(255,92,0,0.1)'
                          : '#111',
                      border:
                        role === 'client'
                          ? '1px solid #FF5C00'
                          : '1px solid #333',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    👤 Client
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('vendeur')}
                    style={{
                      padding: '12px',
                      background:
                        role === 'vendeur'
                          ? 'rgba(255,92,0,0.1)'
                          : '#111',
                      border:
                        role === 'vendeur'
                          ? '1px solid #FF5C00'
                          : '1px solid #333',
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    🏪 Vendeur
                  </button>
                </div>
              </>
            )}

            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '7px',
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@email.com"
              autoComplete="email"
              style={inputStyle}
            />

            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '7px',
              }}
            >
              Mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                mode === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
              style={inputStyle}
            />

            {mode === 'register' && (
              <>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    marginBottom: '7px',
                  }}
                >
                  Confirmer le mot de passe
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </>
            )}

            {error && (
              <div
                style={{
                  background: 'rgba(255,60,60,0.1)',
                  border: '1px solid #FF3C3C',
                  color: '#FF7777',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  background: 'rgba(0,196,140,0.1)',
                  border: '1px solid #00C48C',
                  color: '#55E0B2',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '14px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                }}
              >
                ✅ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              style={{
                width: '100%',
                padding: '14px',
                background: processing ? '#333' : '#FF5C00',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '800',
                fontSize: '14px',
                cursor: processing
                  ? 'not-allowed'
                  : 'pointer',
                marginTop: '4px',
              }}
            >
              {processing
                ? 'Traitement...'
                : mode === 'login'
                  ? 'Se connecter'
                  : 'Créer mon compte'}
            </button>
          </form>

          {/* RETOUR */}
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #2A2A2A',
              borderRadius: '12px',
              color: '#888',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  background: '#111',
  border: '1px solid #333',
  borderRadius: '10px',
  color: 'white',
  outline: 'none',
  fontSize: '14px',
  marginBottom: '16px',
}