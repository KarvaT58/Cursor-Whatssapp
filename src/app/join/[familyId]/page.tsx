'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface GroupFamily {
  id: string
  name: string
  description: string
  photo_url: string
  user_id: string
  created_at: string
}

interface Group {
  id: string
  name: string
  whatsapp_id: string
  invite_link: string
  participants: string[]
  max_participants: number
  is_active: boolean
  group_family: string
}

export default function JoinGroupPage() {
  const params = useParams()
  const familyId = params.familyId as string
  
  const [family, setFamily] = useState<GroupFamily | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()


  useEffect(() => {
    console.log('🚀 useEffect executado, familyId:', familyId)
    
    if (!familyId) {
      console.error('❌ familyId não fornecido')
      setError('ID da família não fornecido')
      setLoading(false)
      return
    }
    
    loadFamilyData()
    
    // Suprimir erros do Google Play Services
    const originalError = window.onerror
    window.onerror = function(message, source, lineno, colno, error) {
      if (message && message.includes('play.google.com')) {
        console.log('⚠️ Erro do Google Play Services ignorado')
        return true // Suprimir o erro
      }
      if (originalError) {
        return originalError(message, source, lineno, colno, error)
      }
      return false
    }
  }, [familyId])

  const loadFamilyData = async () => {
    try {
      console.log('🔍 Carregando dados da família:', familyId)
      console.log('🔧 Configuração Supabase:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      
      
      // Teste de conexão básica
      const { data: testData, error: testError } = await supabase
        .from('group_families')
        .select('count')
        .limit(1)
      
      console.log('🧪 Teste de conexão:', { testData, testError })
      
      if (testError) {
        console.error('❌ Erro na conexão com Supabase:', testError)
        setError(`Erro de conexão: ${testError.message}`)
        setLoading(false)
        return
      }
      
      const { data: familyData, error: familyError } = await supabase
        .from('group_families')
        .select('*')
        .eq('id', familyId)
        .single()

      console.log('📊 Resultado da consulta:', { familyData, familyError })

      if (familyError) {
        console.error('❌ Erro ao carregar família:', familyError)
        setError(`Família não encontrada: ${familyError.message}`)
        return
      }

      if (!familyData) {
        console.error('❌ Nenhum dado retornado para família:', familyId)
        setError('Família não encontrada')
        return
      }

      console.log('✅ Família carregada com sucesso:', familyData)
      setFamily(familyData)
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error)
      setError(`Erro ao carregar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!family) return

    setJoining(true)
    setError(null)

    try {
      const response = await fetch('/api/groups/join-universal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId: family.id,
          familyName: family.name
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar solicitação')
      }

      if (result.inviteLink) {
        // Redirecionar para o link de convite do WhatsApp
        window.location.href = result.inviteLink
      } else {
        setError('Link de convite não disponível')
      }
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error)
      setError(error instanceof Error ? error.message : 'Erro ao entrar no grupo')
    } finally {
      setJoining(false)
    }
  }

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

  if (error || !family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-red-600 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-4">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Erro</h1>
          <p className="text-white/90 mb-6">{error || 'Família não encontrada'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        {/* Foto da Família */}
        {family.photo_url && (
          <div className="mb-6">
            <img
              src={family.photo_url}
              alt={family.name}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white/30 shadow-lg"
            />
          </div>
        )}

        {/* Ícone padrão se não tiver foto */}
        {!family.photo_url && (
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full mx-auto bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
              <span className="text-4xl">👥</span>
            </div>
          </div>
        )}

        {/* Nome da Família */}
        <h1 className="text-3xl font-bold text-white mb-2">
          {family.name}
        </h1>

        {/* Descrição */}
        {family.description && (
          <p className="text-white/90 mb-8 text-lg leading-relaxed">
            {family.description}
          </p>
        )}

        {/* Botão de Participar */}
        <button
          onClick={handleJoinGroup}
          disabled={joining}
          className="w-full bg-white hover:bg-white/90 text-green-600 font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {joining ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-3"></div>
              Processando...
            </div>
          ) : (
            `Participe do Grupo ${family.name}`
          )}
        </button>

        {/* Informações adicionais */}
        <div className="mt-8 text-white/70 text-sm">
          <p>✨ Conecte-se com pessoas incríveis</p>
          <p>🚀 Participe de conversas interessantes</p>
          <p>💬 Compartilhe experiências únicas</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/60 text-xs">
            Powered by WhatsApp Profissional
          </p>
        </div>
      </div>
    </div>
  )
}
