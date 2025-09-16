'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { Campaign } from '@/types/campaigns'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'

interface CampaignProgress {
  campaign_id: string
  sent_count?: number
  total_count?: number
  status?: string
}

interface UseRealtimeCampaignsProps {
  campaignId?: string
  onCampaignUpdate?: (campaign: Record<string, unknown>) => void
  onCampaignProgress?: (progress: {
    campaignId: string
    sent: number
    total: number
    status: string
  }) => void
}

export function useRealtimeCampaigns({
  campaignId,
  onCampaignUpdate,
  onCampaignProgress,
}: UseRealtimeCampaignsProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  // Subscribe to campaign updates
  useEffect(() => {
    if (!isConnected) return

    const campaignChannel = subscribe(
      'campaigns',
      (payload) => {
        console.log('Campaign update received:', payload)

        if (payload.eventType === 'UPDATE' && payload.new) {
          const campaign = payload.new as Campaign

          if (campaignId && campaign.id === campaignId) {
            onCampaignUpdate?.(campaign)
          }

          // Show toast for status changes
          if (
            (payload.old as { status?: string })?.status !==
            (payload.new as { status?: string })?.status
          ) {
            const statusMessages = {
              running: 'Campanha iniciada',
              paused: 'Campanha pausada',
              completed: 'Campanha concluída',
              failed: 'Campanha falhou',
            }

            const message =
              statusMessages[
                (payload.new as { status?: string })
                  ?.status as keyof typeof statusMessages
              ]
            if (message) {
              toast.success(message)
            }
          }
        }
      },
      {
        filter: campaignId ? `id=eq.${campaignId}` : undefined,
      }
    )

    setChannels((prev) => [...prev, campaignChannel])

    return () => {
      unsubscribe(campaignChannel)
      setChannels((prev) => prev.filter((c) => c !== campaignChannel))
    }
  }, [isConnected, campaignId, onCampaignUpdate, subscribe, unsubscribe])

  // Subscribe to campaign progress updates
  useEffect(() => {
    if (!isConnected) return

    const progressChannel = subscribe(
      'campaign_progress',
      (payload) => {
        console.log('Campaign progress update:', payload)

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const progress = payload.new || payload.old
          if (
            progress &&
            campaignId &&
            typeof progress === 'object' &&
            'campaign_id' in progress &&
            progress.campaign_id === campaignId
          ) {
            const campaignProgress = progress as CampaignProgress
            onCampaignProgress?.({
              campaignId: campaignProgress.campaign_id,
              sent: campaignProgress.sent_count || 0,
              total: campaignProgress.total_count || 0,
              status: campaignProgress.status || 'running',
            })
          }
        }
      },
      {
        filter: campaignId ? `campaign_id=eq.${campaignId}` : undefined,
      }
    )

    setChannels((prev) => [...prev, progressChannel])

    return () => {
      unsubscribe(progressChannel)
      setChannels((prev) => prev.filter((c) => c !== progressChannel))
    }
  }, [isConnected, campaignId, onCampaignProgress, subscribe, unsubscribe])

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
