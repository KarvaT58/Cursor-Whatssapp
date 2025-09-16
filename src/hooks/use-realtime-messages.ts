'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { Message } from '@/types/whatsapp'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface UseRealtimeMessagesProps {
  contactId?: string
  groupId?: string
  onMessageReceived?: (message: Message) => void
  onMessageStatusUpdate?: (messageId: string, status: string) => void
  onMessageDeleted?: (messageId: string) => void
}

export function useRealtimeMessages({
  contactId,
  groupId,
  onMessageReceived,
  onMessageStatusUpdate,
  onMessageDeleted,
}: UseRealtimeMessagesProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  // Subscribe to WhatsApp messages
  useEffect(() => {
    if (!isConnected) return

    let filter = ''
    if (contactId) {
      filter = `contact_id=eq.${contactId}`
    } else if (groupId) {
      filter = `group_id=eq.${groupId}`
    }

    const messagesChannel = subscribe(
      'whatsapp_messages',
      (payload) => {
        console.log('Message update received:', payload)

        if (payload.eventType === 'INSERT' && payload.new) {
          const message = payload.new as Message
          onMessageReceived?.(message)

          // Show toast for new messages (only if not from current user)
          if (message.direction === 'inbound') {
            toast.success(`Nova mensagem recebida`)
          }
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          const message = payload.new as Message
          const oldMessage = payload.old as Message

          // Handle status updates
          if (oldMessage?.status !== message.status) {
            onMessageStatusUpdate?.(message.id, message.status)
          }
        } else if (payload.eventType === 'DELETE') {
          const oldMessage = payload.old as Message
          const messageId = oldMessage?.id
          if (messageId) {
            onMessageDeleted?.(messageId)
          }
        }
      },
      {
        filter: filter || undefined,
      }
    )

    setChannels((prev) => [...prev, messagesChannel])

    return () => {
      unsubscribe(messagesChannel)
      setChannels((prev) => prev.filter((c) => c !== messagesChannel))
    }
  }, [
    isConnected,
    contactId,
    groupId,
    onMessageReceived,
    onMessageStatusUpdate,
    onMessageDeleted,
    subscribe,
    unsubscribe,
  ])

  // Subscribe to message status updates
  useEffect(() => {
    if (!isConnected) return

    const statusChannel = subscribe('message_status_updates', (payload) => {
      console.log('Message status update:', payload)

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const statusUpdate = payload.new || payload.old
        if (statusUpdate) {
          const update = statusUpdate as {
            message_id?: string
            status?: string
          }
          if (update.message_id && update.status) {
            onMessageStatusUpdate?.(update.message_id, update.status)
          }
        }
      }
    })

    setChannels((prev) => [...prev, statusChannel])

    return () => {
      unsubscribe(statusChannel)
      setChannels((prev) => prev.filter((c) => c !== statusChannel))
    }
  }, [isConnected, onMessageStatusUpdate, subscribe, unsubscribe])

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      channels.forEach((channel) => unsubscribe(channel))
    }
  }, [channels, unsubscribe])

  return {
    isConnected,
    channelsCount: channels.length,
  }
}
