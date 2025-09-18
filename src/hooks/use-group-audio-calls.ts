import { useState, useCallback } from 'react'

export interface AudioCallParticipant {
  id: string
  call_id: string
  participant_phone: string
  status: 'invited' | 'joined' | 'left' | 'removed'
  joined_at: string | null
  left_at: string | null
  created_at: string
}

export interface GroupAudioCall {
  id: string
  group_id: string
  created_by: string
  created_by_phone: string
  title: string
  description: string | null
  participants: string[]
  status: 'scheduled' | 'active' | 'ended'
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  ended_by: string | null
  end_reason: string | null
  created_at: string
  audio_call_participants?: AudioCallParticipant[]
  participants_count?: number
  is_scheduled?: boolean
  user_status?: string
  can_manage?: boolean
  is_creator?: boolean
}

export interface UseGroupAudioCallsReturn {
  // Operações de chamada
  startCall: (groupId: string, data: StartCallData) => Promise<any>
  getActiveCall: (groupId: string) => Promise<any>
  getCallDetails: (groupId: string, callId: string) => Promise<any>
  endCall: (groupId: string, callId: string, data: EndCallData) => Promise<any>
  
  // Operações de participante
  joinCall: (groupId: string, callId: string) => Promise<any>
  leaveCall: (groupId: string, callId: string) => Promise<any>
  inviteParticipants: (groupId: string, callId: string, participants: string[]) => Promise<any>
  removeParticipant: (groupId: string, callId: string, participantPhone: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface StartCallData {
  participants: string[]
  title?: string
  description?: string
  scheduled_at?: string
}

export interface EndCallData {
  reason?: string
  notify_participants?: boolean
}

export function useGroupAudioCalls(): UseGroupAudioCallsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCall = useCallback(async (groupId: string, data: StartCallData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao iniciar chamada')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getActiveCall = useCallback(async (groupId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter chamada ativa')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCallDetails = useCallback(async (groupId: string, callId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter detalhes da chamada')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const endCall = useCallback(async (groupId: string, callId: string, data: EndCallData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao encerrar chamada')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const joinCall = useCallback(async (groupId: string, callId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'join' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao entrar na chamada')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const leaveCall = useCallback(async (groupId: string, callId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'leave' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao sair da chamada')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const inviteParticipants = useCallback(async (groupId: string, callId: string, participants: string[]): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'invite',
          participants 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao convidar participantes')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeParticipant = useCallback(async (groupId: string, callId: string, participantPhone: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/audio-call/${callId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'remove',
          participant_phone: participantPhone 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover participante')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    startCall,
    getActiveCall,
    getCallDetails,
    endCall,
    joinCall,
    leaveCall,
    inviteParticipants,
    removeParticipant,
    isLoading,
    error,
    clearError,
  }
}
