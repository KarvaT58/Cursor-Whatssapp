'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Message = Database['public']['Tables']['whatsapp_messages']['Row']
type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

interface UseMessageStatusProps {
  contactId?: string
  groupId?: string
  currentUserId?: string
}

export function useMessageStatus({
  contactId,
  groupId,
  currentUserId,
}: UseMessageStatusProps) {
  const [messageStatuses, setMessageStatuses] = useState<{
    [messageId: string]: MessageStatus
  }>({})
  const supabase = createClient()

  // Escutar atualizações de status de mensagens
  useEffect(() => {
    if (!contactId && !groupId) return

    const channel = supabase
      .channel(`message_status_${contactId || groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `contact_id=eq.${contactId || 'null'},group_id=eq.${groupId || 'null'}`,
        },
        (payload) => {
          const message = payload.new as Message
          if (message.user_id === currentUserId) {
            setMessageStatuses((prev) => ({
              ...prev,
              [message.id]: message.status || 'sent',
            }))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [contactId, groupId, currentUserId, supabase])

  // Função para atualizar status de uma mensagem
  const updateMessageStatus = useCallback(
    async (messageId: string, status: MessageStatus) => {
      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .update({ status })
          .eq('id', messageId)

        if (error) {
          console.error('Erro ao atualizar status da mensagem:', error)
        }
      } catch (error) {
        console.error('Erro ao atualizar status da mensagem:', error)
      }
    },
    [supabase]
  )

  // Função para marcar mensagens como lidas
  const markAsRead = useCallback(
    async (messageIds: string[]) => {
      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .update({ status: 'read' })
          .in('id', messageIds)

        if (error) {
          console.error('Erro ao marcar mensagens como lidas:', error)
        }
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error)
      }
    },
    [supabase]
  )

  // Função para marcar mensagens como entregues
  const markAsDelivered = useCallback(
    async (messageIds: string[]) => {
      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .update({ status: 'delivered' })
          .in('id', messageIds)

        if (error) {
          console.error('Erro ao marcar mensagens como entregues:', error)
        }
      } catch (error) {
        console.error('Erro ao marcar mensagens como entregues:', error)
      }
    },
    [supabase]
  )

  // Função para marcar mensagens como falhadas
  const markAsFailed = useCallback(
    async (messageIds: string[]) => {
      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .update({ status: 'failed' })
          .in('id', messageIds)

        if (error) {
          console.error('Erro ao marcar mensagens como falhadas:', error)
        }
      } catch (error) {
        console.error('Erro ao marcar mensagens como falhadas:', error)
      }
    },
    [supabase]
  )

  // Função para obter status de uma mensagem
  const getMessageStatus = useCallback(
    (messageId: string): MessageStatus => {
      return messageStatuses[messageId] || 'sent'
    },
    [messageStatuses]
  )

  return {
    messageStatuses,
    updateMessageStatus,
    markAsRead,
    markAsDelivered,
    markAsFailed,
    getMessageStatus,
  }
}
