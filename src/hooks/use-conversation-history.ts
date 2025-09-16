'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Contact = Database['public']['Tables']['contacts']['Row']
type Message = Database['public']['Tables']['whatsapp_messages']['Row']

export interface ConversationSummary {
  id: string
  contact?: Contact
  groupId?: string
  lastMessage?: Message
  unreadCount: number
  lastActivity: string
}

interface UseConversationHistoryProps {
  userId?: string
}

export function useConversationHistory({
  userId,
}: UseConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Carregar histórico de conversas
  const loadConversations = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Buscar todas as mensagens do usuário agrupadas por contato/grupo
      const { data: messages, error: messagesError } = await supabase
        .from('whatsapp_messages')
        .select(
          `
          *,
          contact:contacts(*),
          group:whatsapp_groups(*)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (messagesError) {
        throw messagesError
      }

      // Agrupar mensagens por contato/grupo
      const conversationMap = new Map<string, ConversationSummary>()

      messages?.forEach((message) => {
        const key = message.contact_id || message.group_id || 'unknown'

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            id: key,
            contact: message.contact,
            groupId: message.group_id || undefined,
            lastMessage: message,
            unreadCount: 0,
            lastActivity: message.created_at || '',
          })
        }

        const conversation = conversationMap.get(key)!

        // Atualizar última mensagem se for mais recente
        if (
          new Date(message.created_at || '') >
          new Date(conversation.lastActivity)
        ) {
          conversation.lastMessage = message
          conversation.lastActivity = message.created_at || ''
        }

        // Contar mensagens não lidas (inbound e não lidas)
        if (message.direction === 'inbound' && message.status !== 'read') {
          conversation.unreadCount++
        }
      })

      // Converter para array e ordenar por última atividade
      const conversationsList = Array.from(conversationMap.values()).sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
      )

      setConversations(conversationsList)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar conversas'
      )
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  // Carregar conversas inicialmente
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Escutar mudanças em tempo real
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('conversation_history')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Recarregar conversas quando houver mudanças
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase, loadConversations])

  // Função para marcar conversa como lida
  const markConversationAsRead = useCallback(
    async (contactId?: string, groupId?: string) => {
      if (!contactId && !groupId) return

      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .update({ status: 'read' })
          .eq('user_id', userId)
          .eq('direction', 'inbound')
          .eq(contactId ? 'contact_id' : 'group_id', contactId || groupId)
          .neq('status', 'read')

        if (error) {
          console.error('Erro ao marcar conversa como lida:', error)
        } else {
          // Recarregar conversas para atualizar contadores
          loadConversations()
        }
      } catch (err) {
        console.error('Erro ao marcar conversa como lida:', err)
      }
    },
    [userId, supabase, loadConversations]
  )

  // Função para arquivar conversa
  const archiveConversation = useCallback(
    async (contactId?: string, groupId?: string) => {
      if (!contactId && !groupId) return

      try {
        // TODO: Implementar campo de arquivamento na tabela de mensagens
        // Por enquanto, apenas recarregar as conversas
        loadConversations()
      } catch (err) {
        console.error('Erro ao arquivar conversa:', err)
      }
    },
    [loadConversations]
  )

  // Função para excluir conversa
  const deleteConversation = useCallback(
    async (contactId?: string, groupId?: string) => {
      if (!contactId && !groupId) return

      try {
        const { error } = await supabase
          .from('whatsapp_messages')
          .delete()
          .eq('user_id', userId)
          .eq(contactId ? 'contact_id' : 'group_id', contactId || groupId)

        if (error) {
          console.error('Erro ao excluir conversa:', error)
        } else {
          loadConversations()
        }
      } catch (err) {
        console.error('Erro ao excluir conversa:', err)
      }
    },
    [userId, supabase, loadConversations]
  )

  // Função para buscar conversas
  const searchConversations = useCallback(
    (query: string) => {
      if (!query.trim()) return conversations

      const lowercaseQuery = query.toLowerCase()
      return conversations.filter((conversation) => {
        const contactName = conversation.contact?.name.toLowerCase() || ''
        const lastMessageContent =
          conversation.lastMessage?.content.toLowerCase() || ''

        return (
          contactName.includes(lowercaseQuery) ||
          lastMessageContent.includes(lowercaseQuery)
        )
      })
    },
    [conversations]
  )

  return {
    conversations,
    loading,
    error,
    markConversationAsRead,
    archiveConversation,
    deleteConversation,
    searchConversations,
    refreshConversations: loadConversations,
  }
}
