'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/providers/realtime-provider'
import { Database } from '@/types/database'

type GroupMessage = Database['public']['Tables']['whatsapp_messages']['Row']

export function useGroupMessages(groupId?: string) {
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { isConnected, subscribe, unsubscribe } = useRealtime()

  useEffect(() => {
    if (!isConnected || !groupId) {
      setLoading(false)
      return
    }

    const fetchMessages = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('whatsapp_messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })

        if (error) {
          throw error
        }
        setMessages(data || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar mensagens'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const channel = subscribe('whatsapp_messages', (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as GroupMessage

        // Verificar se a mensagem é do grupo atual
        if (newMessage.group_id === groupId) {
          setMessages((prev) => [...prev, newMessage])
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new as GroupMessage

        if (updatedMessage.group_id === groupId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      } else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old as GroupMessage

        if (deletedMessage.group_id === groupId) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== deletedMessage.id)
          )
        }
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [isConnected, groupId, subscribe, unsubscribe, supabase])

  const sendMessage = async (
    content: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    mediaUrl?: string
  ) => {
    if (!groupId) {
      throw new Error('ID do grupo é obrigatório')
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('whatsapp_messages')
        .insert({
          content: mediaUrl && type !== 'text' ? mediaUrl : content,
          direction: 'outbound',
          type,
          status: 'sent',
          user_id: user.id,
          group_id: groupId,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return null
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status: 'read' })
        .eq('id', messageId)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err)
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err)
      setError(err instanceof Error ? err.message : 'Erro ao excluir mensagem')
    }
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
  }
}
