'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      color: 'white', fontFamily: 'sans-serif',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏷️</div>
        <div style={{
          fontSize: '72px', fontWeight: '800',
          color: '#FF5C00', marginBottom: '8px',
          fontFamily: 'sans-serif'
        }}>
          404
        </div>
        <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
          Page introuvable
        </div>
        <div style={{ fontSize: '13px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
          La page que tu cherches n'existe pas ou a été déplacée.
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '14px 32px', background: '#FF5C00',
            border: 'none', borderRadius: '12px',
            color: 'white', fontWeight: '700',
            fontSize: '14px', cursor: 'pointer',
            marginBottom: '10px', width: '100%'
          }}
        >
          Retour à l'accueil
        </button>
        <button
          onClick={() => router.back()}
          style={{
            padding: '13px 32px', background: 'transparent',
            border: '1px solid #2A2A2A', borderRadius: '12px',
            color: '#888', fontSize: '13px',
            cursor: 'pointer', width: '100%'
          }}
        >
          ← Page précédente
        </button>
      </div>
    </div>
  )
}