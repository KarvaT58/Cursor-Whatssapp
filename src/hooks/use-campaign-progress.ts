import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CampaignStats } from '@/types/campaigns'

interface CampaignProgress {
  campaignId: string
  stats: CampaignStats
  status: string
  progress: number // Percentage (0-100)
  estimatedCompletion?: Date
}

interface UseCampaignProgressOptions {
  campaignId?: string
  refreshInterval?: number // in milliseconds
  enabled?: boolean
}

export function useCampaignProgress(options: UseCampaignProgressOptions = {}) {
  const { campaignId, refreshInterval = 5000, enabled = true } = options
  const [progress, setProgress] = useState<CampaignProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCampaignProgress = useCallback(async () => {
    if (!campaignId || !enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const { data: campaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, status, stats, recipients, started_at, scheduled_at')
        .eq('id', campaignId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!campaign) {
        throw new Error('Campaign not found')
      }

      const stats = campaign.stats || {
        sent: 0,
        failed: 0,
        total: 0,
        delivered: 0,
        read: 0,
      }
      const totalRecipients = campaign.recipients?.length || 0
      const totalProcessed = stats.sent + stats.failed
      const progressPercentage =
        totalRecipients > 0 ? (totalProcessed / totalRecipients) * 100 : 0

      // Calculate estimated completion time
      let estimatedCompletion: Date | undefined
      if (
        campaign.status === 'running' &&
        campaign.started_at &&
        totalProcessed > 0
      ) {
        const startTime = new Date(campaign.started_at)
        const elapsed = Date.now() - startTime.getTime()
        const rate = totalProcessed / elapsed // messages per millisecond
        const remaining = totalRecipients - totalProcessed
        const estimatedTimeRemaining = remaining / rate
        estimatedCompletion = new Date(Date.now() + estimatedTimeRemaining)
      }

      const campaignProgress: CampaignProgress = {
        campaignId: campaign.id,
        stats,
        status: campaign.status,
        progress: Math.min(100, Math.max(0, progressPercentage)),
        estimatedCompletion,
      }

      setProgress(campaignProgress)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch campaign progress'
      setError(errorMessage)
      console.error('Error fetching campaign progress:', err)
    } finally {
      setIsLoading(false)
    }
  }, [campaignId, enabled, supabase])

  // Initial fetch
  useEffect(() => {
    fetchCampaignProgress()
  }, [fetchCampaignProgress])

  // Set up polling
  useEffect(() => {
    if (!enabled || !campaignId) return

    const interval = setInterval(fetchCampaignProgress, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchCampaignProgress, refreshInterval, enabled, campaignId])

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled || !campaignId) return

    const channel = supabase
      .channel(`campaign-progress-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns',
          filter: `id=eq.${campaignId}`,
        },
        (payload) => {
          console.log('Campaign progress update received:', payload)
          // Refetch progress when campaign is updated
          fetchCampaignProgress()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId, enabled, supabase, fetchCampaignProgress])

  const refresh = useCallback(() => {
    fetchCampaignProgress()
  }, [fetchCampaignProgress])

  return {
    progress,
    isLoading,
    error,
    refresh,
  }
}

// Hook for monitoring multiple campaigns
export function useMultipleCampaignProgress(
  campaignIds: string[],
  options: Omit<UseCampaignProgressOptions, 'campaignId'> = {}
) {
  const [progresses, setProgresses] = useState<Map<string, CampaignProgress>>(
    new Map()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAllProgresses = useCallback(async () => {
    if (campaignIds.length === 0 || !options.enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const { data: campaigns, error: fetchError } = await supabase
        .from('campaigns')
        .select('id, status, stats, recipients, started_at, scheduled_at')
        .in('id', campaignIds)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      const newProgresses = new Map<string, CampaignProgress>()

      campaigns?.forEach((campaign) => {
        const stats = campaign.stats || {
          sent: 0,
          failed: 0,
          total: 0,
          delivered: 0,
          read: 0,
        }
        const totalRecipients = campaign.recipients?.length || 0
        const totalProcessed = stats.sent + stats.failed
        const progressPercentage =
          totalRecipients > 0 ? (totalProcessed / totalRecipients) * 100 : 0

        let estimatedCompletion: Date | undefined
        if (
          campaign.status === 'running' &&
          campaign.started_at &&
          totalProcessed > 0
        ) {
          const startTime = new Date(campaign.started_at)
          const elapsed = Date.now() - startTime.getTime()
          const rate = totalProcessed / elapsed
          const remaining = totalRecipients - totalProcessed
          const estimatedTimeRemaining = remaining / rate
          estimatedCompletion = new Date(Date.now() + estimatedTimeRemaining)
        }

        newProgresses.set(campaign.id, {
          campaignId: campaign.id,
          stats,
          status: campaign.status,
          progress: Math.min(100, Math.max(0, progressPercentage)),
          estimatedCompletion,
        })
      })

      setProgresses(newProgresses)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch campaign progresses'
      setError(errorMessage)
      console.error('Error fetching campaign progresses:', err)
    } finally {
      setIsLoading(false)
    }
  }, [campaignIds, options.enabled, supabase])

  // Initial fetch
  useEffect(() => {
    fetchAllProgresses()
  }, [fetchAllProgresses])

  // Set up polling
  useEffect(() => {
    if (!options.enabled || campaignIds.length === 0) return

    const interval = setInterval(
      fetchAllProgresses,
      options.refreshInterval || 5000
    )
    return () => clearInterval(interval)
  }, [
    fetchAllProgresses,
    options.refreshInterval,
    options.enabled,
    campaignIds,
  ])

  const refresh = useCallback(() => {
    fetchAllProgresses()
  }, [fetchAllProgresses])

  return {
    progresses,
    isLoading,
    error,
    refresh,
  }
}
