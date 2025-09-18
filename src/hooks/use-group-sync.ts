'use client'

import { useState, useCallback } from 'react'
import { useWhatsAppGroups } from './use-whatsapp-groups'
import { useZApi } from './use-z-api'
import { Database } from '@/types/database'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface UseGroupSyncProps {
  userId?: string
  instanceId?: string
}

export function useGroupSync({ userId, instanceId }: UseGroupSyncProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  const { groups, createGroup, updateGroup } = useWhatsAppGroups({ userId })
  const { getMessages } = useZApi()

  // Sincronizar grupos do WhatsApp
  const syncGroupsFromWhatsApp = useCallback(async () => {
    if (!instanceId) {
      setSyncError('Instância Z-API não configurada')
      return { success: false, error: 'Instância Z-API não configurada' }
    }

    try {
      setSyncing(true)
      setSyncError(null)

      // Chamar a API de sincronização real
      const response = await fetch('/api/groups/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId,
          direction: 'from_whatsapp',
          options: {
            forceUpdate: false,
            includeParticipants: true,
            includeAdmins: true,
            includeMessages: false,
            batchSize: 50,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao sincronizar grupos')
      }

      return { success: true, data: result.data, stats: result.stats }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao sincronizar grupos'
      setSyncError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setSyncing(false)
    }
  }, [instanceId])

  // Sincronizar participantes de um grupo específico
  const syncGroupParticipants = useCallback(
    async (groupId: string) => {
      if (!instanceId) {
        setSyncError('Instância Z-API não configurada')
        return { success: false, error: 'Instância Z-API não configurada' }
      }

      try {
        setSyncing(true)
        setSyncError(null)

        // Chamar a API de sincronização de participantes
        const response = await fetch(`/api/groups/${groupId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instanceId,
            syncType: 'participants',
            options: {
              forceUpdate: false,
              includeMetadata: true,
            },
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao sincronizar participantes')
        }

        return { success: true, data: result.data, stats: result.stats }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao sincronizar participantes'
        setSyncError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setSyncing(false)
      }
    },
    [instanceId]
  )

  // Enviar mensagem para grupo
  const sendGroupMessage = useCallback(
    async (groupId: string, message: string) => {
      if (!instanceId) {
        setSyncError('Instância Z-API não configurada')
        return { success: false, error: 'Instância Z-API não configurada' }
      }

      try {
        setSyncing(true)
        setSyncError(null)

        const group = groups.find((g) => g.id === groupId)
        if (!group) {
          throw new Error('Grupo não encontrado')
        }

        // TODO: Implementar envio de mensagem para grupo via Z-API
        // Por enquanto, vamos simular o envio
        console.log(`Enviando mensagem para grupo ${group.name}: ${message}`)

        // Simular delay de envio
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { success: true, data: { messageId: 'mock-message-id' } }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao enviar mensagem'
        setSyncError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setSyncing(false)
      }
    },
    [instanceId, groups]
  )

  // Obter mensagens do grupo
  const getGroupMessages = useCallback(
    async (groupId: string, limit = 50, offset = 0) => {
      if (!instanceId) {
        setSyncError('Instância Z-API não configurada')
        return { success: false, error: 'Instância Z-API não configurada' }
      }

      try {
        setSyncing(true)
        setSyncError(null)

        const group = groups.find((g) => g.id === groupId)
        if (!group) {
          throw new Error('Grupo não encontrado')
        }

        // TODO: Implementar obtenção de mensagens do grupo via Z-API
        // Por enquanto, vamos simular a obtenção
        const mockMessages = [
          {
            id: 'msg-1',
            content: 'Olá pessoal!',
            sender: '5511999999999',
            timestamp: new Date().toISOString(),
            type: 'text',
          },
          {
            id: 'msg-2',
            content: 'Como estão?',
            sender: '5511888888888',
            timestamp: new Date().toISOString(),
            type: 'text',
          },
        ]

        return { success: true, data: mockMessages }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao obter mensagens'
        setSyncError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setSyncing(false)
      }
    },
    [instanceId, groups]
  )

  return {
    syncing,
    syncError,
    syncGroupsFromWhatsApp,
    syncGroupParticipants,
    sendGroupMessage,
    getGroupMessages,
  }
}
