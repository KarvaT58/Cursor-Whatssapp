'use client'

import { useState } from 'react'

interface ZApiMessage {
  phone: string
  message: string
  type?: 'text' | 'image' | 'document' | 'audio'
  mediaUrl?: string
  fileName?: string
}

interface ZApiStatus {
  connected: boolean
  phone?: string
  name?: string
  battery?: number
  qrCode?: string
}

interface ZApiMessagesResponse {
  messages: {
    id: string
    phone: string
    message: string
    type: string
    timestamp: string
  }[]
  total: number
  hasMore: boolean
}

export function useZApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (
    instanceId: string,
    messageData: ZApiMessage
  ): Promise<{
    success: boolean
    data?: Record<string, unknown>
    error?: string
  }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/z-api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId,
          ...messageData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }

      return { success: true, data: data.data }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getStatus = async (
    instanceId: string
  ): Promise<{ success: boolean; status?: ZApiStatus; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/z-api/status?instanceId=${instanceId}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar status')
      }

      return { success: true, status: data.status }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao verificar status'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getQrCode = async (
    instanceId: string
  ): Promise<{ success: boolean; qrCode?: string; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/z-api/qr-code?instanceId=${instanceId}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter QR Code')
      }

      return { success: true, qrCode: data.qrCode }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao obter QR Code'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getMessages = async (
    instanceId: string,
    options?: {
      phone?: string
      limit?: number
      offset?: number
    }
  ): Promise<{
    success: boolean
    messages?: ZApiMessagesResponse
    error?: string
  }> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        instanceId,
        limit: (options?.limit || 20).toString(),
        offset: (options?.offset || 0).toString(),
      })

      if (options?.phone) {
        params.append('phone', options.phone)
      }

      const response = await fetch(`/api/z-api/messages?${params.toString()}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter mensagens')
      }

      return { success: true, messages: data.messages }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao obter mensagens'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const sendTextMessage = async (
    instanceId: string,
    phone: string,
    message: string
  ) => {
    return sendMessage(instanceId, {
      phone,
      message,
      type: 'text',
    })
  }

  const sendImageMessage = async (
    instanceId: string,
    phone: string,
    message: string,
    mediaUrl: string
  ) => {
    return sendMessage(instanceId, {
      phone,
      message,
      type: 'image',
      mediaUrl,
    })
  }

  const sendDocumentMessage = async (
    instanceId: string,
    phone: string,
    message: string,
    mediaUrl: string,
    fileName: string
  ) => {
    return sendMessage(instanceId, {
      phone,
      message,
      type: 'document',
      mediaUrl,
      fileName,
    })
  }

  const sendAudioMessage = async (
    instanceId: string,
    phone: string,
    mediaUrl: string
  ) => {
    return sendMessage(instanceId, {
      phone,
      message: '',
      type: 'audio',
      mediaUrl,
    })
  }

  const sendGroupMessage = async (
    instanceId: string,
    groupId: string,
    message: string
  ) => {
    return sendMessage(instanceId, {
      phone: groupId,
      message,
      type: 'text',
    })
  }

  return {
    loading,
    error,
    sendMessage,
    getStatus,
    getQrCode,
    getMessages,
    sendTextMessage,
    sendImageMessage,
    sendDocumentMessage,
    sendAudioMessage,
    sendGroupMessage,
  }
}
