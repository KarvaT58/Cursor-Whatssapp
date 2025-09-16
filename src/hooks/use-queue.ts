'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'

interface QueueStats {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

interface CampaignQueueStats {
  campaignMessages: QueueStats
  campaignNotifications: QueueStats
  messageRetry: QueueStats
}

export function useQueue() {
  const { user } = useAuth()
  const [stats, setStats] = useState<CampaignQueueStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQueueStats = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/queues/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch queue stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [user])

  const addCampaignMessage = async (jobData: {
    campaignId: string
    contactId: string
    phone: string
    message: string
    instanceId: string
    instanceToken: string
    clientToken: string
  }) => {
    if (!user) return

    try {
      const response = await fetch('/api/queues/campaign-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to add campaign message to queue')
      }

      return await response.json()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const addCampaignNotification = async (jobData: {
    campaignId: string
    status: 'started' | 'completed' | 'failed'
    message?: string
  }) => {
    if (!user) return

    try {
      const response = await fetch('/api/queues/campaign-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to add campaign notification to queue')
      }

      return await response.json()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const addMessageRetry = async (jobData: {
    messageId: string
    phone: string
    message: string
    instanceId: string
    instanceToken: string
    clientToken: string
    retryCount: number
  }) => {
    if (!user) return

    try {
      const response = await fetch('/api/queues/message-retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error('Failed to add message retry to queue')
      }

      return await response.json()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const clearQueue = async (queueName: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/queues/${queueName}/clear`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear queue')
      }

      await fetchQueueStats() // Refresh stats
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const pauseQueue = async (queueName: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/queues/${queueName}/pause`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to pause queue')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const resumeQueue = async (queueName: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/queues/${queueName}/resume`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to resume queue')
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (user) {
      fetchQueueStats()

      // Refresh stats every 30 seconds
      const interval = setInterval(fetchQueueStats, 30000)
      return () => clearInterval(interval)
    }
  }, [user, fetchQueueStats])

  return {
    stats,
    loading,
    error,
    fetchQueueStats,
    addCampaignMessage,
    addCampaignNotification,
    addMessageRetry,
    clearQueue,
    pauseQueue,
    resumeQueue,
  }
}
