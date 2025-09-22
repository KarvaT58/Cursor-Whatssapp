'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function JoinGroupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [familyName, setFamilyName] = useState('')
  const params = useParams()
  const familyId = params.familyId as string

  useEffect(() => {
    // Buscar nome da família
    const fetchFamilyName = async () => {
      try {
        const response = await fetch(`/api/groups/family/${familyId}`)
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            setFamilyName(data.name || 'Grupo')
          } else {
            console.error('Resposta não é JSON válido:', await response.text())
            setFamilyName('Grupo')
          }
        } else {
          console.error('Erro HTTP:', response.status, response.statusText)
          setFamilyName('Grupo')
        }
      } catch (error) {
        console.error('Erro ao buscar nome da família:', error)
        setFamilyName('Grupo')
      }
    }

    if (familyId) {
      fetchFamilyName()
    }
  }, [familyId])

  const handleJoinGroup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/groups/join-universal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: familyId,
          familyName: familyName || 'Grupo'
        }),
      })

      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()

        if (response.ok && data.inviteLink) {
          // Redirecionar para o link de convite do WhatsApp
          window.location.href = data.inviteLink
        } else {
          setError(data.error || 'Erro ao processar solicitação')
        }
      } else {
        // Se não for JSON, mostrar o texto da resposta
        const textResponse = await response.text()
        console.error('Resposta não é JSON válido:', textResponse)
        setError('Erro no servidor. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao participar do grupo:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

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
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          A página está carregando corretamente.
        </p>
        
        {familyName && (
          <p style={{ color: '#374151', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Família: <strong>{familyName}</strong>
          </p>
        )}

        <button
          onClick={handleJoinGroup}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            width: '100%',
            marginBottom: '1rem'
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#059669'
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#10b981'
            }
          }}
        >
          {isLoading ? 'Processando...' : `Participar do Grupo ${familyName ? `- ${familyName}` : ''}`}
        </button>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '6px',
            marginTop: '1rem'
          }}>
            {error}
          </div>
        )}

        <p style={{ color: '#6b7280', marginTop: '1rem', fontSize: '0.9rem' }}>
          Sistema de Link Universal Ativo
        </p>
      </div>
    </div>
  )
}