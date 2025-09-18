import { useState, useCallback } from 'react'

export interface GroupInviteLink {
  id: string
  group_id: string
  invite_code: string
  created_by: string
  expires_at: string | null
  max_uses: number | null
  description: string | null
  is_active: boolean
  created_at: string
  current_uses?: number
  remaining_uses?: number | null
  is_expired?: boolean
  is_max_uses_reached?: boolean
}

export interface UseGroupInviteLinksReturn {
  // Operações de link de convite
  getInviteLink: (groupId: string) => Promise<any>
  createInviteLink: (groupId: string, data: CreateInviteLinkData) => Promise<any>
  revokeInviteLink: (groupId: string) => Promise<any>
  joinGroup: (inviteCode: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface CreateInviteLinkData {
  expires_in_hours?: number
  max_uses?: number
  description?: string
}

export function useGroupInviteLinks(): UseGroupInviteLinksReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInviteLink = useCallback(async (groupId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/invite-link`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter link de convite')
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

  const createInviteLink = useCallback(async (groupId: string, data: CreateInviteLinkData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/invite-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar link de convite')
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

  const revokeInviteLink = useCallback(async (groupId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/invite-link`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao revogar link de convite')
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

  const joinGroup = useCallback(async (inviteCode: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao entrar no grupo')
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
    getInviteLink,
    createInviteLink,
    revokeInviteLink,
    joinGroup,
    isLoading,
    error,
    clearError,
  }
}
