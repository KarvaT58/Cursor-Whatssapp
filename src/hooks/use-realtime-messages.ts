'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Message = Database['public']['Tables']['whatsapp_messages']['Row']

export function useRealtimeMessages(contactId?: string, groupId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from('whatsapp_messages')
          .select('*')
          .order('created_at', { ascending: true })

        if (contactId) {
          query = query.eq('contact_id', contactId)
        } else if (groupId) {
          query = query.eq('group_id', groupId)
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw fetchError
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
  }, [contactId, groupId, supabase])

  useEffect(() => {
    if (!isConnected) return

    const channel = subscribe('whatsapp_messages', (payload) => {
      console.log('Nova mensagem recebida:', payload)

      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as Message

        // Verificar se a mensagem é relevante para o contexto atual
        const isRelevant =
          (!contactId && !groupId) || // Todas as mensagens
          (contactId && newMessage.contact_id === contactId) || // Mensagem do contato
          (groupId && newMessage.group_id === groupId) // Mensagem do grupo

        if (isRelevant) {
          setMessages((prev) => [...prev, newMessage])
        }
      } else if (payload.eventType === 'UPDATE') {
        const updatedMessage = payload.new as Message

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedMessage = payload.old as Message

        setMessages((prev) =>
          prev.filter((msg) => msg.id !== deletedMessage.id)
        )
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [isConnected, contactId, groupId, subscribe, unsubscribe])

  const sendMessage = async (
    content: string,
    contactId?: string,
    groupId?: string,
    type: 'text' | 'image' | 'document' | 'audio' = 'text',
    mediaUrl?: string
  ) => {
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
          content,
          direction: 'outbound',
          type,
          status: 'sent',
          user_id: user.id,
          contact_id: contactId || null,
          group_id: groupId || null,
          ...(mediaUrl && { content: mediaUrl }), // Para mídia, usar URL como conteúdo
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
      throw err
    }
  }

  return {
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    refetch: () => {
      setLoading(true)
      // Trigger re-fetch by updating dependency
    },
  }
}
