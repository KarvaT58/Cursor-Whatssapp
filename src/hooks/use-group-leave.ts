import { useState, useCallback } from 'react'

export interface LeaveGroupParams {
  groupId: string
  reason?: string
  notifyMembers?: boolean
}

export interface LeaveGroupResult {
  message: string
  user: {
    phone: string
    left_at: string
    reason: string
    was_admin: boolean
  }
  group: {
    id: string
    name: string
    participants_count: number
    admins_count: number
  }
  notifications: {
    sent: boolean
    recipients_count: number
  }
}

export interface UseGroupLeaveReturn {
  leaveGroup: (params: LeaveGroupParams) => Promise<LeaveGroupResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupLeave(): UseGroupLeaveReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const leaveGroup = useCallback(async (params: LeaveGroupParams): Promise<LeaveGroupResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: params.reason,
          notify_members: params.notifyMembers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao sair do grupo')
      }

      const result: LeaveGroupResult = await response.json()
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
    leaveGroup,
    isLoading,
    error,
    clearError,
  }
}
