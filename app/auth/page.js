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
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    if (mode === 'inscription') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          nom,
          role,
        })
        setMessage('Compte créé ! Vérifie ton email pour confirmer.')
      }

    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'vendeur') {
        router.push('/dashboard')
      } else if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1A1A1A',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid #2A2A2A'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#FF5C00'
          }}>
            Promo's<span style={{ color: 'white' }}>World</span>
          </div>
        </div>

        {/* Tabs connexion / inscription */}
        <div style={{
          display: 'flex',
          background: '#111',
          borderRadius: '10px',
          padding: '4px',
          marginBottom: '24px',
          border: '1px solid #222'
        }}>
          {['connexion', 'inscription'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '7px',
                border: 'none',
                background: mode === m ? '#FF5C00' : 'transparent',
                color: mode === m ? 'white' : '#888',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {m === 'connexion' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Champ nom (inscription seulement) */}
        {mode === 'inscription' && (
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
              Nom complet
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ton nom"
              style={{
                width: '100%',
                padding: '12px 14px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Champ email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ton@email.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#111',
              border: '1px solid #333',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Champ mot de passe */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#111',
              border: '1px solid #333',
              borderRadius: '10px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Choix du rôle (inscription seulement) */}
        {mode === 'inscription' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '8px' }}>
              Je suis...
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['client', 'vendeur'].map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: role === r ? '1px solid #FF5C00' : '1px solid #333',
                    background: role === r ? 'rgba(255,92,0,0.1)' : '#111',
                    color: role === r ? '#FF5C00' : '#888',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {r === 'client' ? '🛍️ Client' : '🏪 Vendeur'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message d'erreur ou succès */}
        {message && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: message.includes('créé') ? 'rgba(0,196,140,0.1)' : 'rgba(255,60,60,0.1)',
            border: `1px solid ${message.includes('créé') ? '#00C48C' : '#FF3C3C'}`,
            color: message.includes('créé') ? '#00C48C' : '#FF3C3C',
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            {message}
          </div>
        )}

        {/* Bouton soumettre */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#333' : '#FF5C00',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Chargement...' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </div>
    </div>
  )
}