import { useState, useCallback } from 'react'

export interface AddParticipantsParams {
  groupId: string
  participants: string[]
}

export interface RemoveParticipantsParams {
  groupId: string
  participants: string[]
}

export interface AddParticipantsResult {
  message: string
  group: any
  added: string[]
  duplicates: string[]
  total_participants: number
}

export interface RemoveParticipantsResult {
  message: string
  group: any
  removed: string[]
  not_found: string[]
  total_participants: number
}

export interface UseGroupParticipantsReturn {
  addParticipants: (params: AddParticipantsParams) => Promise<AddParticipantsResult>
  removeParticipants: (params: RemoveParticipantsParams) => Promise<RemoveParticipantsResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupParticipants(): UseGroupParticipantsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addParticipants = useCallback(async (params: AddParticipantsParams): Promise<AddParticipantsResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: params.participants,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar participantes')
      }

      const result: AddParticipantsResult = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeParticipants = useCallback(async (params: RemoveParticipantsParams): Promise<RemoveParticipantsResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/participants`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: params.participants,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover participantes')
      }

      const result: RemoveParticipantsResult = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    addParticipants,
    removeParticipants,
    isLoading,
    error,
    clearError,
  }
}
