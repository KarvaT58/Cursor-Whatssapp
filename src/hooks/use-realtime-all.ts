'use client'

import {} from 'react'
import { useRealtimeCampaigns } from './use-realtime-campaigns'
import { useRealtimeMessages } from './use-realtime-messages'
import { useRealtimeContacts } from './use-realtime-contacts'
import { useRealtimeGroups } from './use-realtime-groups'
import { useRealtimeQueues } from './use-realtime-queues'
import { useRealtimeNotifications } from './use-realtime-notifications'
import { useRealtime } from '@/providers/realtime-provider'
import { Contact } from '@/types/contacts'
import { Message } from '@/types/whatsapp'

interface UseRealtimeAllProps {
  // Campaign props
  campaignId?: string
  onCampaignUpdate?: (campaign: Record<string, unknown>) => void
  onCampaignProgress?: (progress: {
    campaignId: string
    sent: number
    total: number
    status: string
  }) => void

  // Message props
  contactId?: string
  groupId?: string
  onMessageReceived?: (message: Message) => void
  onMessageStatusUpdate?: (messageId: string, status: string) => void
  onMessageDeleted?: (messageId: string) => void

  // Contact props
  onContactAdded?: (contact: Contact) => void
  onContactUpdated?: (contact: Contact) => void
  onContactDeleted?: (contactId: string) => void
  onContactImported?: (count: number) => void

  // Group props
  onGroupAdded?: (group: Record<string, unknown>) => void
  onGroupUpdated?: (group: Record<string, unknown>) => void
  onGroupDeleted?: (groupId: string) => void
  onGroupSynced?: (groupId: string, participantCount: number) => void

  // Queue props
  onQueueStatsUpdate?: (stats: {
    queueName: string
    waiting: number
    active: number
    completed: number
    failed: number
    delayed: number
  }) => void
  onJobCompleted?: (jobId: string, queueName: string) => void
  onJobFailed?: (jobId: string, queueName: string, error: string) => void
  onJobProgress?: (jobId: string, progress: number) => void

  // Notification props
  onNotificationReceived?: (notification: {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
    action_url?: string
  }) => void
  onNotificationRead?: (notificationId: string) => void
  onSystemAlert?: (alert: { type: string; message: string }) => void
}

export function useRealtimeAll(props: UseRealtimeAllProps = {}) {
  const { isConnected, connectionStatus } = useRealtime()

  // Initialize all realtime hooks
  const campaigns = useRealtimeCampaigns({
    campaignId: props.campaignId,
    onCampaignUpdate: props.onCampaignUpdate,
    onCampaignProgress: props.onCampaignProgress,
  })

  const messages = useRealtimeMessages({
    contactId: props.contactId,
    groupId: props.groupId,
    onMessageReceived: props.onMessageReceived,
    onMessageStatusUpdate: props.onMessageStatusUpdate,
    onMessageDeleted: props.onMessageDeleted,
  })

  const contacts = useRealtimeContacts({
    onContactAdded: props.onContactAdded,
    onContactUpdated: props.onContactUpdated,
    onContactDeleted: props.onContactDeleted,
    onContactImported: props.onContactImported,
  })

  const groups = useRealtimeGroups({
    onGroupAdded: props.onGroupAdded,
    onGroupUpdated: props.onGroupUpdated,
    onGroupDeleted: props.onGroupDeleted,
    onGroupSynced: props.onGroupSynced,
  })

  const queues = useRealtimeQueues({
    onQueueStatsUpdate: props.onQueueStatsUpdate,
    onJobCompleted: props.onJobCompleted,
    onJobFailed: props.onJobFailed,
    onJobProgress: props.onJobProgress,
  })

  const notifications = useRealtimeNotifications({
    onNotificationReceived: props.onNotificationReceived,
    onNotificationRead: props.onNotificationRead,
    onSystemAlert: props.onSystemAlert,
  })

  // Calculate total channels
  const totalChannels =
    campaigns.channelsCount +
    messages.channelsCount +
    contacts.channelsCount +
    groups.channelsCount +
    queues.channelsCount +
    notifications.channelsCount

  return {
    // Connection status
    isConnected,
    connectionStatus,

    // Individual hook statuses
    campaigns: {
      isConnected: campaigns.isConnected,
      channelsCount: campaigns.channelsCount,
    },
    messages: {
      isConnected: messages.isConnected,
      channelsCount: messages.channelsCount,
    },
    contacts: {
      isConnected: contacts.isConnected,
      channelsCount: contacts.channelsCount,
    },
    groups: {
      isConnected: groups.isConnected,
      channelsCount: groups.channelsCount,
    },
    queues: {
      isConnected: queues.isConnected,
      channelsCount: queues.channelsCount,
    },
    notifications: {
      isConnected: notifications.isConnected,
      channelsCount: notifications.channelsCount,
      unreadCount: notifications.unreadCount,
    },

    // Overall stats
    totalChannels,
    allConnected: isConnected && totalChannels > 0,
  }
}
