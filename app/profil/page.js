'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profil() {
  const router = useRouter()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [wallet, setWallet] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    initPage()
  }, [])

  const initPage = async () => {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData?.user) {
      router.push('/auth')
      return
    }

    const currentUser = authData.user
    setUser(currentUser)

    const { data: profileData, error: profileError } =
      await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

    if (profileError) {
      console.error('Erreur profil :', profileError)
      setError('Impossible de récupérer votre profil.')
      setLoading(false)
      return
    }

    if (profileData) {
      setProfile(profileData)
      setNom(profileData.nom || '')
      setTelephone(profileData.telephone || '')
      setAdresse(profileData.adresse || '')
    }

    const { data: walletData, error: walletError } =
      await supabase
        .from('wallets')
        .select('solde_disponible, solde_bloque')
        .eq('user_id', currentUser.id)
        .maybeSingle()

    if (!walletError) {
      setWallet(walletData)
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user || saving) return

    setSaving(true)
    setMessage('')
    setError('')

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        nom: nom.trim(),
        telephone: telephone.trim(),
        adresse: adresse.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur modification profil :', updateError)
      setError(`Impossible de modifier le profil : ${updateError.message}`)
      setSaving(false)
      return
    }

    setProfile(data)
    setMessage('✅ Profil mis à jour avec succès.')
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString('fr-FR')
  }

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Administrateur'
    if (role === 'vendeur') return 'Vendeur'
    if (role === 'client') return 'Client'
    return role || 'Utilisateur'
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
          👤 Mon profil
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#888',
            marginBottom: '24px',
          }}
        >
          Consulte et modifie tes informations personnelles.
        </div>

        {/* MESSAGES */}
        {message && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
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

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid #FF3C3C',
              color: '#FF7A7A',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {error}
          </div>
        )}

        {/* IDENTITÉ */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '20px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                width: '58px',
                height: '58px',
                borderRadius: '50%',
                background: '#FF5C00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '23px',
                fontWeight: '900',
              }}
            >
              {nom
                ? nom.charAt(0).toUpperCase()
                : '👤'}
            </div>

            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                }}
              >
                {nom || 'Utilisateur'}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#888',
                  marginTop: '4px',
                }}
              >
                {getRoleLabel(profile?.role)}
              </div>
            </div>
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              Adresse email
            </label>

            <input
              value={user?.email || ''}
              disabled
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                background: '#111',
                border: '1px solid #252525',
                borderRadius: '10px',
                color: '#777',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          {/* NOM */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              Nom
            </label>

            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ton nom"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          {/* TÉLÉPHONE */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              Téléphone
            </label>

            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Ex : 97000000"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          {/* ADRESSE */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#888',
                marginBottom: '7px',
              }}
            >
              Adresse
            </label>

            <textarea
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ton adresse"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px',
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                color: 'white',
                outline: 'none',
                fontSize: '13px',
                resize: 'vertical',
              }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '13px',
              background: saving ? '#333' : '#FF5C00',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '800',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>

        {/* PORTEFEUILLE */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '800',
              marginBottom: '14px',
            }}
          >
            💰 Mon portefeuille
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                background: '#111',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #252525',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                Disponible
              </div>

              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '900',
                  color: '#00C48C',
                }}
              >
                {formatMoney(wallet?.solde_disponible)} FCFA
              </div>
            </div>

            <div
              style={{
                background: '#111',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #252525',
              }}
            >
              <div
                style={{
                  color: '#888',
                  fontSize: '11px',
                  marginBottom: '5px',
                }}
              >
                Fonds bloqués
              </div>

              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '900',
                  color: '#FFB800',
                }}
              >
                {formatMoney(wallet?.solde_bloque)} FCFA
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/wallet')}
            style={{
              width: '100%',
              padding: '11px',
              background: '#151515',
              border: '1px solid #333',
              borderRadius: '11px',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Ouvrir mon portefeuille →
          </button>
        </div>

        {/* RACCOURCIS */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '18px',
            padding: '18px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '800',
              marginBottom: '12px',
            }}
          >
            Raccourcis
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '9px',
            }}
          >
            <button
              onClick={() => router.push('/reservations')}
              style={shortcutStyle}
            >
              📦 Mes réservations
            </button>

            <button
              onClick={() => router.push('/transactions')}
              style={shortcutStyle}
            >
              💳 Transactions
            </button>

            <button
              onClick={() => router.push('/litiges')}
              style={shortcutStyle}
            >
              ⚠️ Mes litiges
            </button>

            <button
              onClick={() => router.push('/messages')}
              style={shortcutStyle}
            >
              💬 Messages
            </button>

            {profile?.role === 'vendeur' && (
              <button
                onClick={() => router.push('/dashboard')}
                style={shortcutStyle}
              >
                📊 Espace vendeur
              </button>
            )}

            {profile?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                style={shortcutStyle}
              >
                🛠️ Administration
              </button>
            )}
          </div>
        </div>

        {/* DÉCONNEXION */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '13px',
            background: 'transparent',
            border: '1px solid #FF3C3C',
            borderRadius: '12px',
            color: '#FF3C3C',
            fontWeight: '800',
            cursor: 'pointer',
          }}
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

const shortcutStyle = {
  padding: '12px',
  background: '#151515',
  border: '1px solid #2A2A2A',
  borderRadius: '10px',
  color: 'white',
  fontSize: '12px',
  fontWeight: '700',
  cursor: 'pointer',
}