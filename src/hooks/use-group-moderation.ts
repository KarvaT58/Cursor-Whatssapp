import { useState, useCallback } from 'react'

export interface ModerationAction {
  id: string
  group_id: string
  message_id: string
  action_type: 'delete_message' | 'delete_message_by_report' | 'ban_user' | 'unban_user'
  moderator_id: string
  moderator_phone: string
  target_user_phone: string
  reason: string | null
  created_at: string
}

export interface GroupReport {
  id: string
  group_id: string
  message_id: string
  reporter_phone: string
  reported_user_phone: string
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'violence' | 'hate_speech' | 'fake_news' | 'other'
  description: string | null
  evidence: string[] | null
  status: 'pending' | 'approved' | 'rejected' | 'dismissed'
  moderator_id: string | null
  moderator_phone: string | null
  moderator_notes: string | null
  processed_at: string | null
  created_at: string
  group_messages?: {
    id: string
    content: string
    sender_phone: string
    created_at: string
    is_deleted: boolean
  }
}

export interface UseGroupModerationReturn {
  // Operações de mensagens
  deleteMessage: (groupId: string, messageId: string, data: DeleteMessageData) => Promise<any>
  getMessageDetails: (groupId: string, messageId: string) => Promise<any>
  
  // Operações de denúncias
  createReport: (groupId: string, data: CreateReportData) => Promise<any>
  getReports: (groupId: string, filters: ReportFilters) => Promise<any>
  processReport: (groupId: string, reportId: string, data: ProcessReportData) => Promise<any>
  getReportDetails: (groupId: string, reportId: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface DeleteMessageData {
  reason?: string
  notify_author?: boolean
}

export interface CreateReportData {
  message_id: string
  reason: 'spam' | 'harassment' | 'inappropriate_content' | 'violence' | 'hate_speech' | 'fake_news' | 'other'
  description?: string
  evidence?: string[]
}

export interface ReportFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'dismissed'
  page?: number
  limit?: number
}

export interface ProcessReportData {
  action: 'approve' | 'reject' | 'dismiss'
  moderator_notes?: string
  auto_delete_message?: boolean
}

export function useGroupModeration(): UseGroupModerationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteMessage = useCallback(async (groupId: string, messageId: string, data: DeleteMessageData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao apagar mensagem')
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

  const getMessageDetails = useCallback(async (groupId: string, messageId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/messages/${messageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter detalhes da mensagem')
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

  const createReport = useCallback(async (groupId: string, data: CreateReportData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar denúncia')
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

  const getReports = useCallback(async (groupId: string, filters: ReportFilters = {}): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (filters.status) searchParams.append('status', filters.status)
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/groups/${groupId}/reports?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar denúncias')
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

  const processReport = useCallback(async (groupId: string, reportId: string, data: ProcessReportData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar denúncia')
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

  const getReportDetails = useCallback(async (groupId: string, reportId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/reports/${reportId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter detalhes da denúncia')
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
    deleteMessage,
    getMessageDetails,
    createReport,
    getReports,
    processReport,
    getReportDetails,
    isLoading,
    error,
    clearError,
  }
}
