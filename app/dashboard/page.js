'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [promotions, setPromotions] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorie: '👗 Mode',
    prix_original: '',
    prix_promo: '',
    stock: 1,
    date_expiration: '',
    pays: '',
    ville: ''
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [message, setMessage] = useState('')

  const categories = ['👗 Mode', '📱 Tech', '🍔 Food', '🏠 Maison', '💄 Beauté', '👟 Chaussures']

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

    if (profileData?.role !== 'vendeur') { router.push('/'); return }

    setProfile(profileData)
    fetchPromotions(data.user.id)
    fetchReservations(data.user.id)
  }

  const fetchPromotions = async (userId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('vendeur_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setPromotions(data || [])
    setLoading(false)
  }

  const fetchReservations = async (userId) => {
    const { data } = await supabase
      .from('reservations')
      .select(`*, promotions!inner(vendeur_id)`)
      .eq('promotions.vendeur_id', userId)
      .eq('statut', 'en_attente')

    setReservations(data || [])
  }

  const handleMedia = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePublier = async () => {
    if (!formData.titre || !formData.prix_original || !formData.prix_promo) {
      setMessage('Remplis tous les champs obligatoires.')
      return
    }

    if (Number(formData.prix_promo) >= Number(formData.prix_original)) {
      setMessage('Le prix promo doit être inférieur au prix original.')
      return
    }

    setUploadingPhoto(true)
    let photo_url = null

    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('promos')
        .upload(fileName, photo)

      if (uploadError) {
        setMessage('Erreur lors du téléchargement du fichier.')
        setUploadingPhoto(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('promos')
        .getPublicUrl(fileName)

      photo_url = urlData.publicUrl
    }

    setUploadingPhoto(false)

    const { error } = await supabase.from('promotions').insert({
      vendeur_id: user.id,
      titre: formData.titre,
      description: formData.description,
      categorie: formData.categorie,
      prix_original: Number(formData.prix_original),
      prix_promo: Number(formData.prix_promo),
      stock: Number(formData.stock),
      date_expiration: formData.date_expiration || null,
      statut: 'en_attente',
      photo_url,
      pays: formData.pays,
      ville: formData.ville,
    })

    if (error) {
      setMessage('Erreur lors de la publication.')
      return
    }

    setMessage("Promo soumise ! En attente de validation par l'admin.")
    setShowForm(false)
    setFormData({
      titre: '', description: '', categorie: '👗 Mode',
      prix_original: '', prix_promo: '', stock: 1,
      date_expiration: '', pays: '', ville: ''
    })
    setPhoto(null)
    setPhotoPreview(null)
    fetchPromotions(user.id)
  }

  const statutColor = (statut) => {
    if (statut === 'actif') return { bg: 'rgba(0,196,140,0.15)', color: '#00C48C' }
    if (statut === 'en_attente') return { bg: 'rgba(255,184,0,0.15)', color: '#FFB800' }
    if (statut === 'rejete') return { bg: 'rgba(255,60,60,0.1)', color: '#FF3C3C' }
    return { bg: 'rgba(255,255,255,0.05)', color: '#888' }
  }

  const statutLabel = (statut) => {
    if (statut === 'actif') return 'Actif'
    if (statut === 'en_attente') return 'En attente'
    if (statut === 'rejete') return 'Rejeté'
    return 'Expiré'
  }

  const reduction = (original, promo) => Math.round((1 - promo / original) * 100)

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
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: 'white', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        background: '#0A0A0A', borderBottom: '1px solid #1E1E1E',
        padding: '14px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        zIndex: 100
      }}>
        <div
          onClick={() => router.push('/')}
          style={{ fontSize: '20px', fontWeight: '800', color: '#FF5C00', cursor: 'pointer' }}
        >
          Promo's<span style={{ color: 'white' }}>World</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/messages')}
            style={{
              padding: '8px 14px', background: '#1A1A1A',
              border: '1px solid #333', borderRadius: '8px',
              color: 'white', fontSize: '13px', cursor: 'pointer'
            }}
          >
            💬
          </button>
          <span style={{ fontSize: '13px', color: '#888' }}>🏪 {profile?.nom}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/auth') }}
            style={{
              padding: '8px 16px', background: 'transparent',
              border: '1px solid #333', borderRadius: '8px',
              color: '#888', fontSize: '13px', cursor: 'pointer'
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: '80px 20px 40px', maxWidth: '900px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Bonjour 👋</div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>
            {profile?.nom}
          </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Promos actives', value: promotions.filter(p => p.statut === 'actif').length, icon: '✅' },
              { label: 'En attente', value: promotions.filter(p => p.statut === 'en_attente').length, icon: '⏳' },
              { label: 'Total promos', value: promotions.length, icon: '📦' },
              { label: 'Réservations', value: reservations.length, icon: '🔔', action: () => router.push('/dashboard/reservations') },
            ].map(stat => (
              <div
                key={stat.label}
                onClick={stat.action}
                style={{
                  background: '#1A1A1A', borderRadius: '14px',
                  padding: '16px', border: stat.action ? '1px solid #FF5C00' : '1px solid #2A2A2A',
                  cursor: stat.action ? 'pointer' : 'default'
                }}
              >
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: stat.action ? '#FF5C00' : '#FF5C00' }}>{stat.value}</div>
                {stat.action && (
                  <div style={{ fontSize: '10px', color: '#FF5C00', marginTop: '4px' }}>Voir tout →</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RACCOURCIS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/dashboard/reservations')}
            style={{
              padding: '10px 16px', background: '#1A1A1A',
              border: '1px solid #2A2A2A', borderRadius: '10px',
              color: 'white', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            📦 Réservations reçues
            {reservations.length > 0 && (
              <span style={{
                background: '#FF5C00', color: 'white',
                fontSize: '10px', fontWeight: '700',
                padding: '1px 6px', borderRadius: '10px'
              }}>
                {reservations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/messages')}
            style={{
              padding: '10px 16px', background: '#1A1A1A',
              border: '1px solid #2A2A2A', borderRadius: '10px',
              color: 'white', fontSize: '13px', cursor: 'pointer'
            }}
          >
            💬 Mes messages
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
            background: message.includes('Erreur') || message.includes('Remplis') || message.includes('inférieur')
              ? 'rgba(255,60,60,0.1)' : 'rgba(0,196,140,0.1)',
            border: `1px solid ${message.includes('Erreur') || message.includes('Remplis') || message.includes('inférieur')
              ? '#FF3C3C' : '#00C48C'}`,
            color: message.includes('Erreur') || message.includes('Remplis') || message.includes('inférieur')
              ? '#FF3C3C' : '#00C48C',
            fontSize: '13px'
          }}>
            {message}
          </div>
        )}

        {/* BOUTON PUBLIER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Mes promotions</div>
          <button
            onClick={() => { setShowForm(!showForm); setMessage('') }}
            style={{
              padding: '10px 20px', background: '#FF5C00',
              border: 'none', borderRadius: '10px',
              color: 'white', fontWeight: '700',
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            {showForm ? '✕ Annuler' : '＋ Publier une promo'}
          </button>
        </div>

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{
            background: '#1A1A1A', borderRadius: '16px',
            padding: '24px', border: '1px solid #2A2A2A',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>
              Nouvelle promotion
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Titre de la promo *</label>
                <input
                  style={inputStyle}
                  placeholder="Ex: Nike Air Max 270 - Taille 42"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  placeholder="Décris ton article, l'état, les détails importants..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Photo ou vidéo de l'article</label>
                <div
                  onClick={() => document.getElementById('fileInput').click()}
                  style={{
                    border: '2px dashed #333', borderRadius: '12px',
                    padding: '20px', textAlign: 'center',
                    cursor: 'pointer', background: '#111',
                  }}
                >
                  {photoPreview ? (
                    photo?.type.startsWith('video') ? (
                      <video src={photoPreview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                    ) : (
                      <img src={photoPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                    )
                  ) : (
                    <>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                      <div style={{ fontSize: '13px', color: '#888' }}>Clique pour ajouter une photo ou vidéo</div>
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>JPG, PNG, WEBP, MP4 — max 50MB</div>
                    </>
                  )}
                </div>
                <input id="fileInput" type="file" accept="image/jpeg,image/png,image/webp,video/mp4" style={{ display: 'none' }} onChange={handleMedia} />
                {photoPreview && (
                  <button onClick={() => { setPhoto(null); setPhotoPreview(null) }} style={{ marginTop: '8px', padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: '8px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
                    ✕ Supprimer
                  </button>
                )}
              </div>

              <div>
                <label style={labelStyle}>Catégorie</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.categorie} onChange={e => setFormData({ ...formData, categorie: e.target.value })}>
                  {categories.map(cat => (<option key={cat} value={cat} style={{ background: '#111' }}>{cat}</option>))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Stock disponible</label>
                <input style={inputStyle} type="number" min="1" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Prix original (FCFA) *</label>
                <input style={inputStyle} type="number" placeholder="58000" value={formData.prix_original} onChange={e => setFormData({ ...formData, prix_original: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Prix promo (FCFA) *</label>
                <input style={inputStyle} type="number" placeholder="35000" value={formData.prix_promo} onChange={e => setFormData({ ...formData, prix_promo: e.target.value })} />
              </div>

              {formData.prix_original && formData.prix_promo && Number(formData.prix_promo) < Number(formData.prix_original) && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ background: 'rgba(255,92,0,0.1)', border: '1px solid rgba(255,92,0,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#FF5C00' }}>
                    🔥 Réduction de {reduction(formData.prix_original, formData.prix_promo)}% — Acompte client : {Math.round(formData.prix_promo * 0.2).toLocaleString()} FCFA
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Pays</label>
                <input style={inputStyle} placeholder="Ex: Bénin" value={formData.pays} onChange={e => setFormData({ ...formData, pays: e.target.value })} />
              </div>

              <div>
                <label style={labelStyle}>Ville</label>
                <input style={inputStyle} placeholder="Ex: Cotonou" value={formData.ville} onChange={e => setFormData({ ...formData, ville: e.target.value })} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Date d'expiration (optionnel)</label>
                <input style={inputStyle} type="date" value={formData.date_expiration} onChange={e => setFormData({ ...formData, date_expiration: e.target.value })} />
              </div>
            </div>

            <button
              onClick={handlePublier}
              disabled={uploadingPhoto}
              style={{
                width: '100%', padding: '14px',
                background: uploadingPhoto ? '#333' : '#FF5C00',
                border: 'none', borderRadius: '12px',
                color: 'white', fontWeight: '700',
                fontSize: '14px', cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                marginTop: '20px'
              }}
            >
              {uploadingPhoto ? '⏳ Upload en cours...' : 'Soumettre pour validation'}
            </button>
          </div>
        )}

        {/* LISTE DES PROMOS */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Chargement...</div>
        ) : promotions.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '60px 20px', background: '#1A1A1A', borderRadius: '16px', border: '1px solid #2A2A2A' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏷️</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Aucune promo publiée</div>
            <div style={{ fontSize: '13px' }}>Clique sur "Publier une promo" pour commencer</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {promotions.map(promo => (
              <div key={promo.id} style={{ background: '#1A1A1A', borderRadius: '14px', border: '1px solid #2A2A2A', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
                  <div style={{ width: '56px', height: '56px', background: '#252525', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {promo.photo_url ? (
                      promo.photo_url.includes('.mp4') ? (
                        <video src={promo.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img src={promo.photo_url} alt={promo.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )
                    ) : (
                      <span style={{ fontSize: '22px' }}>🏷️</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{promo.titre}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {promo.prix_promo.toLocaleString()} FCFA
                      <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#555' }}>{promo.prix_original.toLocaleString()} FCFA</span>
                      <span style={{ marginLeft: '8px', color: '#FF5C00' }}>-{reduction(promo.prix_original, promo.prix_promo)}%</span>
                    </div>
                    {(promo.ville || promo.pays) && (
                      <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>📍 {[promo.ville, promo.pays].filter(Boolean).join(', ')}</div>
                    )}
                  </div>
                  <div style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600', background: statutColor(promo.statut).bg, color: statutColor(promo.statut).color, flexShrink: 0 }}>
                    {statutLabel(promo.statut)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}