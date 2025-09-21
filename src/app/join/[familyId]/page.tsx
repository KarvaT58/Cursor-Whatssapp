export default function JoinGroupPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#4ade80', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>
          Link Universal Funcionando!
        </h1>
        <p style={{ color: '#6b7280' }}>
          A página está carregando corretamente.
        </p>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          Timestamp: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}