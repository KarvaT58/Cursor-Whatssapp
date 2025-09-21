'use client'

export default function JoinGroupPage() {
  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      background: 'linear-gradient(135deg, #4ade80, #3b82f6, #8b5cf6)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          Link Universal Funcionando!
        </h1>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          A página está carregando corretamente.
        </p>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          Sistema de Link Universal Ativo
        </p>
      </div>
    </div>
  )
}