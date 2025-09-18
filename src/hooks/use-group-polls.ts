import { useState, useCallback } from 'react'

export interface PollOption {
  option: string
  index: number
  votes: number
  percentage: number
}

export interface PollStats {
  total_votes: number
  option_votes: PollOption[]
  has_user_voted: boolean
  user_vote: number[]
  is_expired: boolean
}

export interface GroupPoll {
  id: string
  group_id: string
  question: string
  options: string[]
  allow_multiple: boolean
  expires_at: string | null
  created_by: string
  created_at: string
  stats: PollStats
}

export interface UseGroupPollsReturn {
  // Operações de enquete
  createPoll: (groupId: string, data: CreatePollData) => Promise<any>
  getPolls: (groupId: string) => Promise<any>
  votePoll: (groupId: string, pollId: string, selectedOptions: number[]) => Promise<any>
  removeVote: (groupId: string, pollId: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface CreatePollData {
  question: string
  options: string[]
  allow_multiple?: boolean
  expires_at?: string
}

export function useGroupPolls(): UseGroupPollsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPoll = useCallback(async (groupId: string, data: CreatePollData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar enquete')
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

  const getPolls = useCallback(async (groupId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/polls`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar enquetes')
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

  const votePoll = useCallback(async (groupId: string, pollId: string, selectedOptions: number[]): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_options: selectedOptions }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao votar na enquete')
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

  const removeVote = useCallback(async (groupId: string, pollId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/polls/${pollId}/vote`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover voto')
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
    createPoll,
    getPolls,
    votePoll,
    removeVote,
    isLoading,
    error,
    clearError,
  }
}
