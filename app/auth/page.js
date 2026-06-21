'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('connexion')
  const [role, setRole] = useState('client')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (mode === 'inscription') {
      if (!nom || !email || !password || !adresse) {
        setMessage('Nom, email, localisation et mot de passe sont obligatoires.')
        setLoading(false)
        return
      }

      if (password.length < 6) {
        setMessage('Le mot de passe doit faire au moins 6 caractères.')
        setLoading(false)
        return
      }

      const selectedRole = role === 'vendeur' ? 'vendeur' : 'client'

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nom: nom.trim(),
            role: selectedRole,
            telephone: telephone.trim(),
            adresse: adresse.trim(),
          },
        },
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          nom: nom.trim(),
          role: selectedRole,
          telephone: telephone.trim(),
          adresse: adresse.trim(),
        })

        await supabase.from('wallets').upsert({
          user_id: data.user.id,
          solde_disponible: 0,
          solde_bloque: 0,
        })

        setMessage('success')
        setTimeout(() => {
          setMode('connexion')
          setMessage('')
          setNom('')
          setEmail('')
          setTelephone('')
          setAdresse('')
          setPassword('')
          setRole('client')
        }, 2000)
      }
    } else {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    setMessage(error.message)
    setLoading(false)
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Erreur profil :', profileError)
    setMessage("Impossible de récupérer le rôle du compte.")
    setLoading(false)
    return
  }

  if (!profile) {
    setMessage("Profil introuvable. Déconnecte-toi puis reconnecte-toi.")
    setLoading(false)
    return
  }

  if (profile.role === 'vendeur') {
    router.replace('/dashboard')
  } else if (profile.role === 'admin') {
    router.replace('/admin')
  } else {
    router.replace('/')
  }
}

    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#111', border: '1px solid #333',
    borderRadius: '10px', color: 'white',
    fontSize: '13px', outline: 'none',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: '12px', color: '#888',
    display: 'block', marginBottom: '6px'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: '#1A1A1A', borderRadius: '20px',
        padding: '32px', border: '1px solid #2A2A2A'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#FF5C00' }}>
            Promo's<span style={{ color: 'white' }}>World</span>
          </div>
        </div>

        <div style={{
          display: 'flex', background: '#111',
          borderRadius: '10px', padding: '4px',
          marginBottom: '24px', border: '1px solid #222'
        }}>
          {['connexion', 'inscription'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMessage('') }}
              style={{
                flex: 1, padding: '9px',
                borderRadius: '7px', border: 'none',
                background: mode === m ? '#FF5C00' : 'transparent',
                color: mode === m ? 'white' : '#888',
                fontWeight: '600', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'sans-serif'
              }}
            >
              {m === 'connexion' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {message === 'success' && (
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'rgba(0,196,140,0.1)',
            border: '1px solid #00C48C',
            color: '#00C48C', fontSize: '13px',
            textAlign: 'center', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontWeight: '700', marginBottom: '4px' }}>Compte créé !</div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              Tu peux maintenant te connecter.
            </div>
          </div>
        )}

        {message !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'inscription' && (
              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Ton nom"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Email *</label>
              <input
                style={inputStyle}
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {mode === 'inscription' && (
              <div>
                <label style={labelStyle}>Téléphone Mobile Money</label>
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="+229 XX XX XX XX"
                  value={telephone}
                  onChange={e => setTelephone(e.target.value)}
                />
              </div>
            )}

            {mode === 'inscription' && (
              <div>
                <label style={labelStyle}>Ville / Localisation *</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Ex: Cotonou, Bénin"
                  value={adresse}
                  onChange={e => setAdresse(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Mot de passe *</label>
              <input
                style={inputStyle}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {mode === 'inscription' && (
                <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>
                  Minimum 6 caractères
                </div>
              )}
            </div>

            {mode === 'inscription' && (
              <div>
                <label style={labelStyle}>Je suis... *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['client', 'vendeur'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1, padding: '10px',
                        borderRadius: '10px',
                        border: role === r ? '1px solid #FF5C00' : '1px solid #333',
                        background: role === r ? 'rgba(255,92,0,0.1)' : '#111',
                        color: role === r ? '#FF5C00' : '#888',
                        fontWeight: '600', fontSize: '13px',
                        cursor: 'pointer', fontFamily: 'sans-serif'
                      }}
                    >
                      {r === 'client' ? '🛍️ Client' : '🏪 Vendeur'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {message && message !== 'success' && (
              <div style={{
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(255,60,60,0.1)',
                border: '1px solid #FF3C3C',
                color: '#FF3C3C', fontSize: '12px'
              }}>
                {message}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#333' : '#FF5C00',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: '700',
                fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'sans-serif'
              }}
            >
              {loading ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}