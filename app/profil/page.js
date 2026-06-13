'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    adresse: '',
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { router.push('/auth'); return }
    setUser(data.user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setFormData({
        nom: profileData.nom || '',
        telephone: profileData.telephone || '',
        adresse: profileData.adresse || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        nom: formData.nom,
        telephone: formData.telephone,
        adresse: formData.adresse,
      })
      .eq('id', user.id)

    if (error) {
      setMessage('Erreur lors de la sauvegarde.')
    } else {
      setMessage('✅ Profil mis à jour !')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontFamily: 'sans-serif' }}>
      Chargement...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', gap: '12px', zIndex: 100
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: '36px', height: '36px',
            background: '#1A1A1A', border: '1px solid #2A2A2A',
            borderRadius: '10px', color: 'white',
            fontSize: '16px', cursor: 'pointer'
          }}
        >
          ←
        </button>
        <div style={{ fontSize: '18px', fontWeight: '800', color: '#FF5C00' }}>
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '500px', margin: '0 auto' }}>

        {/* AVATAR */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', background: '#1A1A1A',
            borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 12px',
            border: '2px solid #FF5C00'
          }}>
            {profile?.role === 'vendeur' ? '🏪' : '👤'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
            {profile?.nom || 'Mon profil'}
          </div>
          <div style={{
            display: 'inline-block', padding: '3px 10px',
            background: 'rgba(255,92,0,0.1)',
            border: '1px solid rgba(255,92,0,0.3)',
            borderRadius: '20px', fontSize: '11px', color: '#FF5C00'
          }}>
            {profile?.role === 'vendeur' ? '🏪 Vendeur' : profile?.role === 'admin' ? '⚙️ Admin' : '🛍️ Client'}
          </div>
        </div>

        {/* FORMULAIRE */}
        <div style={{
          background: '#1A1A1A', borderRadius: '16px',
          padding: '24px', border: '1px solid #2A2A2A',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '20px' }}>
            Informations personnelles
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Nom {profile?.role === 'vendeur' ? 'de la boutique' : 'complet'}</label>
              <input
                style={inputStyle}
                placeholder="Ton nom"
                value={formData.nom}
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Numéro de téléphone (Mobile Money)</label>
              <input
                style={inputStyle}
                placeholder="+229 XX XX XX XX"
                value={formData.telephone}
                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>{profile?.role === 'vendeur' ? 'Adresse de la boutique' : 'Adresse'}</label>
              <input
                style={inputStyle}
                placeholder="Ex: Cotonou, Bénin"
                value={formData.adresse}
                onChange={e => setFormData({ ...formData, adresse: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* EMAIL (non modifiable) */}
        <div style={{
          background: '#1A1A1A', borderRadius: '16px',
          padding: '24px', border: '1px solid #2A2A2A',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
            Compte
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Email</div>
          <div style={{
            padding: '12px 14px', background: '#111',
            border: '1px solid #222', borderRadius: '10px',
            fontSize: '13px', color: '#555'
          }}>
            {user?.email}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
            L'email ne peut pas être modifié
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
            background: message.includes('Erreur') ? 'rgba(255,60,60,0.1)' : 'rgba(0,196,140,0.1)',
            border: `1px solid ${message.includes('Erreur') ? '#FF3C3C' : '#00C48C'}`,
            color: message.includes('Erreur') ? '#FF3C3C' : '#00C48C',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px',
            background: saving ? '#333' : '#FF5C00',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: '700',
            fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
            marginBottom: '10px'
          }}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>

        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }}
          style={{
            width: '100%', padding: '13px',
            background: 'transparent', border: '1px solid #333',
            borderRadius: '12px', color: '#888',
            fontSize: '13px', cursor: 'pointer'
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}