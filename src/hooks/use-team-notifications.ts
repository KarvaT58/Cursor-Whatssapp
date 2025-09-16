'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtime } from '@/providers/realtime-provider'

interface TeamNotification {
  id: string
  type:
    | 'message'
    | 'member_joined'
    | 'member_left'
    | 'role_changed'
    | 'team_updated'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  userId?: string
  userName?: string
  messageId?: string
}

interface UseTeamNotificationsOptions {
  teamId: string
  enabled?: boolean
}

interface UseTeamNotificationsReturn {
  notifications: TeamNotification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearNotification: (notificationId: string) => Promise<void>
  clearAllNotifications: () => Promise<void>
  refresh: () => Promise<void>
}

export function useTeamNotifications({
  teamId,
  enabled = true,
}: UseTeamNotificationsOptions): UseTeamNotificationsReturn {
  const [notifications, setNotifications] = useState<TeamNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { subscribe, unsubscribe, isConnected } = useRealtime()

  const fetchNotifications = useCallback(async () => {
    if (!enabled || !teamId) return

    setIsLoading(true)
    setError(null)

    try {
      // For now, we'll create mock notifications based on team messages
      // In a real implementation, you'd have a notifications table
      const { data: messages, error: messagesError } = await supabase
        .from('team_messages')
        .select(
          `
          id,
          content,
          created_at,
          sender:users!team_messages_sender_id_fkey (
            id,
            name
          )
        `
        )
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (messagesError) {
        throw messagesError
      }

      // Convert messages to notifications
      const messageNotifications: TeamNotification[] = (messages || []).map(
        (msg) => ({
          id: `msg_${msg.id}`,
          type: 'message' as const,
          title: 'Nova mensagem',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          description: `${(msg.sender as any)[0]?.name || 'Usuário'}: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
          timestamp: msg.created_at,
          isRead: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: (msg.sender as any)[0]?.id || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userName: (msg.sender as any)[0]?.name || 'Usuário',
          messageId: msg.id,
        })
      )

      setNotifications(messageNotifications)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch notifications'
      setError(errorMessage)
      console.error('Error fetching team notifications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [teamId, enabled, supabase])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      )
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }, [])

  const clearNotification = useCallback(async (notificationId: string) => {
    try {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      )
    } catch (err) {
      console.error('Error clearing notification:', err)
    }
  }, [])

  const clearAllNotifications = useCallback(async () => {
    try {
      setNotifications([])
    } catch (err) {
      console.error('Error clearing all notifications:', err)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchNotifications()
  }, [fetchNotifications])

  // Initial load
  useEffect(() => {
    if (enabled && teamId) {
      fetchNotifications()
    }
  }, [enabled, teamId, fetchNotifications])

  // Real-time updates for new messages
  useEffect(() => {
    if (!enabled || !teamId || !isConnected) return

    const channel = subscribe(
      'team_messages',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as {
            id: string
            content: string
            created_at: string
            sender_id: string
            sender?: { name: string }
          }

          // Create notification for new message
          const newNotification: TeamNotification = {
            id: `msg_${newMessage.id}`,
            type: 'message',
            title: 'Nova mensagem',
            description: `${newMessage.sender?.name || 'Usuário'}: ${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
            timestamp: newMessage.created_at,
            isRead: false,
            userId: newMessage.sender_id,
            userName: newMessage.sender?.name,
            messageId: newMessage.id,
          }

          setNotifications((prev) => [newNotification, ...prev])
        }
      },
      {
        schema: 'public',
        table: 'team_messages',
        filter: `team_id=eq.${teamId}`,
      }
    )

    return () => {
      unsubscribe(channel)
    }
  }, [enabled, teamId, isConnected, subscribe, unsubscribe])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    refresh,
  }
}
