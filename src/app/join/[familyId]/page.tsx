'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function JoinGroupPage() {
  const params = useParams()
  const familyId = params.familyId as string
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('🚀 Componente carregado, familyId:', familyId)

  useEffect(() => {
    console.log('🚀 useEffect executado, familyId:', familyId)
    
    if (!familyId) {
      console.error('❌ familyId não fornecido')
      setError('ID da família não fornecido')
      setLoading(false)
      return
    }
    
    // Simular carregamento
    setTimeout(() => {
      console.log('✅ Carregamento simulado concluído')
      setLoading(false)
    }, 2000)
  }, [familyId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro!</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Link Universal Funcionando!
        </h1>
        <p className="text-gray-600 mb-4">
          Family ID: {familyId}
        </p>
        <p className="text-gray-600">
          A página está carregando corretamente. Agora vamos implementar a funcionalidade completa.
        </p>
      </div>
    </div>
  )
}