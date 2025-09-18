import { useState, useCallback } from 'react'

export interface ApproveParticipantParams {
  groupId: string
  participantPhone: string
  approvedBy: string
}

export interface RejectParticipantParams {
  groupId: string
  participantPhone: string
  rejectedBy: string
  reason?: string
}

export interface PendingParticipant {
  phone: string
  name: string | null
  pushname: string | null
  display_name: string
}

export interface GroupApprovalInfo {
  group: {
    id: string
    name: string
    whatsapp_id: string | null
    participants_count: number
    admins_count: number
    created_at: string
  }
  pending_participants: PendingParticipant[]
  pending_count: number
  can_approve: boolean
}

export interface UseGroupApprovalsReturn {
  approveParticipant: (params: ApproveParticipantParams) => Promise<any>
  rejectParticipant: (params: RejectParticipantParams) => Promise<any>
  getPendingParticipants: (groupId: string) => Promise<GroupApprovalInfo>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupApprovals(): UseGroupApprovalsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const approveParticipant = useCallback(async (params: ApproveParticipantParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_phone: params.participantPhone,
          approved_by: params.approvedBy,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao aprovar participante')
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

  const rejectParticipant = useCallback(async (params: RejectParticipantParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_phone: params.participantPhone,
          rejected_by: params.rejectedBy,
          reason: params.reason,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao rejeitar participante')
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

  const getPendingParticipants = useCallback(async (groupId: string): Promise<GroupApprovalInfo> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar participantes pendentes')
      }

      const result: GroupApprovalInfo = await response.json()
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
    approveParticipant,
    rejectParticipant,
    getPendingParticipants,
    isLoading,
    error,
    clearError,
  }
}
