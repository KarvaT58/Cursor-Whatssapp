import { useState, useCallback } from 'react'

export interface SendMessageParams {
  groupId: string
  content: string
  type?: 'text' | 'image' | 'document' | 'audio'
  mentions?: string[]
  reply_to_message_id?: string
}

export interface SendMessageResult {
  message: string
  message_data: any
  mentions: {
    valid: string[]
    invalid: string[]
  }
  group: {
    id: string
    name: string
    participants_count: number
  }
}

export interface GetMessagesParams {
  groupId: string
  page?: number
  limit?: number
}

export interface GetMessagesResult {
  messages: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  group: {
    id: string
    name: string
    participants_count: number
  }
}

export interface UseGroupMessagesReturn {
  sendMessage: (params: SendMessageParams) => Promise<SendMessageResult>
  getMessages: (params: GetMessagesParams) => Promise<GetMessagesResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupMessages(): UseGroupMessagesReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (params: SendMessageParams): Promise<SendMessageResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: params.content,
          type: params.type || 'text',
          mentions: params.mentions || [],
          reply_to_message_id: params.reply_to_message_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar mensagem')
      }

      const result: SendMessageResult = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getMessages = useCallback(async (params: GetMessagesParams): Promise<GetMessagesResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())

      const response = await fetch(`/api/groups/${params.groupId}/messages?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar mensagens')
      }

      const result: GetMessagesResult = await response.json()
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
    sendMessage,
    getMessages,
    isLoading,
    error,
    clearError,
  }
}