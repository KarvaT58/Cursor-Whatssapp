'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface QueueStats {
  queueName: string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

interface UseRealtimeQueuesProps {
  onQueueStatsUpdate?: (stats: QueueStats) => void
  onJobCompleted?: (jobId: string, queueName: string) => void
  onJobFailed?: (jobId: string, queueName: string, error: string) => void
  onJobProgress?: (jobId: string, progress: number) => void
}

export function useRealtimeQueues({
  onQueueStatsUpdate,
  onJobCompleted,
  onJobFailed,
  onJobProgress,
}: UseRealtimeQueuesProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  // Subscribe to queue stats
  useEffect(() => {
    if (!isConnected) return

    const queueStatsChannel = subscribe('queue_stats', (payload) => {
      console.log('Queue stats update:', payload)

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const stats = payload.new || payload.old
        if (stats) {
          const queueStats = stats as QueueStats
          onQueueStatsUpdate?.(queueStats)
        }
      }
    })

    setChannels((prev) => [...prev, queueStatsChannel])

    return () => {
      unsubscribe(queueStatsChannel)
      setChannels((prev) => prev.filter((c) => c !== queueStatsChannel))
    }
  }, [isConnected, onQueueStatsUpdate, subscribe, unsubscribe])

  // Subscribe to job updates
  useEffect(() => {
    if (!isConnected) return

    const jobUpdatesChannel = subscribe('job_updates', (payload) => {
      console.log('Job update received:', payload)

      if (payload.eventType === 'UPDATE' && payload.new) {
        const job = payload.new as {
          id?: string
          queue_name?: string
          status?: string
          error?: string
          progress?: number
        }

        if (job.status === 'completed' && job.id && job.queue_name) {
          onJobCompleted?.(job.id, job.queue_name)
          toast.success(`Job concluído: ${job.queue_name}`)
        } else if (job.status === 'failed' && job.id && job.queue_name) {
          onJobFailed?.(
            job.id,
            job.queue_name,
            job.error || 'Erro desconhecido'
          )
          toast.error(`Job falhou: ${job.queue_name}`)
        } else if (job.progress !== undefined && job.id) {
          onJobProgress?.(job.id, job.progress)
        }
      }
    })

    setChannels((prev) => [...prev, jobUpdatesChannel])

    return () => {
      unsubscribe(jobUpdatesChannel)
      setChannels((prev) => prev.filter((c) => c !== jobUpdatesChannel))
    }
  }, [
    isConnected,
    onJobCompleted,
    onJobFailed,
    onJobProgress,
    subscribe,
    unsubscribe,
  ])

  // Subscribe to rate limit updates
  useEffect(() => {
    if (!isConnected) return

    const rateLimitChannel = subscribe('rate_limits', (payload) => {
      console.log('Rate limit update:', payload)

      if (payload.eventType === 'UPDATE' && payload.new) {
        const rateLimit = payload.new as {
          is_limited?: boolean
          limit_type?: string
        }
        if (rateLimit.is_limited) {
          toast.warning(
            `Rate limit atingido: ${rateLimit.limit_type || 'tipo desconhecido'}`
          )
        }
      }
    })

    setChannels((prev) => [...prev, rateLimitChannel])

    return () => {
      unsubscribe(rateLimitChannel)
      setChannels((prev) => prev.filter((c) => c !== rateLimitChannel))
    }
  }, [isConnected, subscribe, unsubscribe])

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
