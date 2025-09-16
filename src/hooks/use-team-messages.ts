'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/providers/realtime-provider'
import {
  TeamMessageWithUser,
  SendMessageData,
  EditMessageData,
  MessageSearchFilters,
  MessageSearchResult,
} from '@/types/teams'

interface UseTeamMessagesOptions {
  teamId: string
  channel?: string
  limit?: number
  enabled?: boolean
  refreshInterval?: number
}

interface UseTeamMessagesReturn {
  messages: TeamMessageWithUser[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  sendMessage: (data: SendMessageData) => Promise<void>
  editMessage: (messageId: string, data: EditMessageData) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  loadMore: () => Promise<void>
  searchMessages: (
    filters: MessageSearchFilters
  ) => Promise<MessageSearchResult>
  refresh: () => Promise<void>
}

export function useTeamMessages({
  teamId,
  channel = 'general',
  limit = 50,
  enabled = true,
  refreshInterval = 5000,
}: UseTeamMessagesOptions): UseTeamMessagesReturn {
  const [messages, setMessages] = useState<TeamMessageWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)

  const supabase = createClient()
  const { subscribeToTeamMessages, unsubscribe, isConnected } = useRealtime()

  const fetchMessages = useCallback(
    async (reset = false) => {
      if (!enabled || !teamId) return

      setIsLoading(true)
      setError(null)

      try {
        const currentOffset = reset ? 0 : offset

        const { data, error: fetchError } = await supabase
          .from('team_messages')
          .select(
            `
          *,
          sender:users!team_messages_sender_id_fkey (
            id,
            name,
            email,
            role
          ),
          replyTo:team_messages!team_messages_reply_to_id_fkey (
            id,
            content,
            sender:users!team_messages_sender_id_fkey (
              id,
              name
            )
          )
        `
          )
          .eq('team_id', teamId)
          .eq('channel', channel)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1)

        if (fetchError) {
          throw fetchError
        }

        const formattedMessages =
          data?.map((msg) => ({
            ...msg,
            sender: msg.sender,
            replyTo: msg.replyTo
              ? {
                  ...msg.replyTo,
                  sender: msg.replyTo.sender,
                }
              : undefined,
          })) || []

        if (reset) {
          setMessages(formattedMessages)
          setOffset(limit)
        } else {
          setMessages((prev) => [...prev, ...formattedMessages])
          setOffset((prev) => prev + limit)
        }

        setHasMore(formattedMessages.length === limit)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch messages'
        setError(errorMessage)
        console.error('Error fetching team messages:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [teamId, channel, limit, offset, enabled, supabase]
  )

  const sendMessage = useCallback(
    async (data: SendMessageData) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase.from('team_messages').insert({
          team_id: teamId,
          sender_id: user.id,
          content: data.content,
          message_type: data.messageType || 'text',
          channel: data.channel || channel,
          reply_to_id: data.replyToId,
          metadata: data.metadata || {},
        })

        if (error) throw error
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        console.error('Error sending message:', err)
        throw err
      }
    },
    [teamId, channel, supabase]
  )

  const editMessage = useCallback(
    async (messageId: string, data: EditMessageData) => {
      try {
        const { error } = await supabase
          .from('team_messages')
          .update({
            content: data.content,
            metadata: data.metadata || {},
            is_edited: true,
            edited_at: new Date().toISOString(),
          })
          .eq('id', messageId)

        if (error) throw error
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to edit message'
        setError(errorMessage)
        console.error('Error editing message:', err)
        throw err
      }
    },
    [supabase]
  )

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const { error } = await supabase
          .from('team_messages')
          .delete()
          .eq('id', messageId)

        if (error) throw error
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete message'
        setError(errorMessage)
        console.error('Error deleting message:', err)
        throw err
      }
    },
    [supabase]
  )

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    await fetchMessages(false)
  }, [hasMore, isLoading, fetchMessages])

  const searchMessages = useCallback(
    async (filters: MessageSearchFilters): Promise<MessageSearchResult> => {
      try {
        let query = supabase
          .from('team_messages')
          .select(
            `
          *,
          sender:users!team_messages_sender_id_fkey (
            id,
            name,
            email,
            role
          )
        `
          )
          .eq('team_id', teamId)
          .eq('channel', channel)

        if (filters.query) {
          query = query.textSearch('content', filters.query)
        }

        if (filters.senderId) {
          query = query.eq('sender_id', filters.senderId)
        }

        if (filters.messageType) {
          query = query.eq('message_type', filters.messageType)
        }

        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom)
        }

        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo)
        }

        const {
          data,
          error: searchError,
          count,
        } = await query.order('created_at', { ascending: false }).limit(100)

        if (searchError) throw searchError

        return {
          messages: data || [],
          total: count || 0,
          query: filters.query || '',
          filters,
        }
      } catch (err) {
        console.error('Error searching messages:', err)
        throw err
      }
    },
    [teamId, channel, supabase]
  )

  const refresh = useCallback(async () => {
    setOffset(0)
    await fetchMessages(true)
  }, [fetchMessages])

  // Initial load
  useEffect(() => {
    if (enabled && teamId) {
      fetchMessages(true)
    }
  }, [enabled, teamId, channel, fetchMessages])

  // Real-time updates
  useEffect(() => {
    if (!enabled || !teamId || !isConnected) return

    const channel = subscribeToTeamMessages(teamId, (payload) => {
      // Handle real-time updates from Supabase
      if (payload.eventType === 'INSERT') {
        // New message created
        const newMessage = payload.new as TeamMessageWithUser
        setMessages((prev) => [newMessage, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        // Message updated
        const updatedMessage = payload.new as TeamMessageWithUser
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        )
      } else if (payload.eventType === 'DELETE') {
        // Message deleted
        const deletedMessage = payload.old as TeamMessageWithUser
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== deletedMessage.id)
        )
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [enabled, teamId, isConnected, subscribeToTeamMessages, unsubscribe])

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return

    const interval = setInterval(() => {
      if (!isLoading) {
        refresh()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [enabled, refreshInterval, isLoading, refresh])

  return {
    messages,
    isLoading,
    error,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMore,
    searchMessages,
    refresh,
  }
}

// Hook for team presence
export function useTeamPresence(teamId: string) {
  const [onlineMembers, setOnlineMembers] = useState<Set<string>>(new Set())
  const { subscribeToTeamPresence, unsubscribe, isConnected } = useRealtime()

  useEffect(() => {
    if (!teamId || !isConnected) return

    const channel = subscribeToTeamPresence(teamId, (payload) => {
      if (payload.type === 'presence_sync') {
        const state = payload.state as Record<string, unknown[]>
        const online = new Set(Object.keys(state))
        setOnlineMembers(online)
      } else if (payload.type === 'presence_join') {
        setOnlineMembers((prev) => new Set([...prev, payload.key as string]))
      } else if (payload.type === 'presence_leave') {
        setOnlineMembers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(payload.key as string)
          return newSet
        })
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [teamId, isConnected, subscribeToTeamPresence, unsubscribe])

  return {
    onlineMembers,
    isOnline: (userId: string) => onlineMembers.has(userId),
  }
}
