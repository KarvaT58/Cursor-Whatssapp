import { useState, useCallback } from 'react'

export interface MessageReaction {
  emoji: string
  count: number
  users: string[]
  userReacted: boolean
}

export interface UseMessageReactionsReturn {
  // Operações de reação
  addReaction: (groupId: string, messageId: string, emoji: string) => Promise<any>
  removeReaction: (groupId: string, messageId: string) => Promise<any>
  getReactions: (groupId: string, messageId: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useMessageReactions(): UseMessageReactionsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addReaction = useCallback(async (groupId: string, messageId: string, emoji: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar reação')
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

  const removeReaction = useCallback(async (groupId: string, messageId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}/reactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover reação')
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

  const getReactions = useCallback(async (groupId: string, messageId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}/reactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar reações')
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

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    addReaction,
    removeReaction,
    getReactions,
    isLoading,
    error,
    clearError,
  }
}
