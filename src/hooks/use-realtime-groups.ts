'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { Group } from '@/types/groups'
import { toast } from 'sonner'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeGroupsProps {
  onGroupAdded?: (group: Record<string, unknown>) => void
  onGroupUpdated?: (group: Record<string, unknown>) => void
  onGroupDeleted?: (groupId: string) => void
  onGroupSynced?: (groupId: string, participantCount: number) => void
}

export function useRealtimeGroups({
  onGroupAdded,
  onGroupUpdated,
  onGroupDeleted,
  onGroupSynced,
}: UseRealtimeGroupsProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  // Subscribe to groups table
  useEffect(() => {
    if (!isConnected) return

    const groupsChannel = subscribe('whatsapp_groups', (payload) => {
      console.log('Group update received:', payload)

      if (payload.eventType === 'INSERT' && payload.new) {
        const group = payload.new as Group
        onGroupAdded?.(group)
        toast.success(`Novo grupo adicionado: ${group.name}`)
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const group = payload.new as Group
        onGroupUpdated?.(group)

        // Show toast for participant count changes
        const oldGroup = payload.old as Group
        if (oldGroup?.participants?.length !== group.participants?.length) {
          toast.success(
            `Grupo ${group.name} atualizado: ${group.participants?.length || 0} participantes`
          )
        }
      } else if (payload.eventType === 'DELETE') {
        const groupId = (payload.old as Group)?.id
        if (groupId) {
          onGroupDeleted?.(groupId)
          toast.success('Grupo removido')
        }
      }
    })

    setChannels((prev) => [...prev, groupsChannel])

    return () => {
      unsubscribe(groupsChannel)
      setChannels((prev) => prev.filter((c) => c !== groupsChannel))
    }
  }, [
    isConnected,
    onGroupAdded,
    onGroupUpdated,
    onGroupDeleted,
    subscribe,
    unsubscribe,
  ])

  // Subscribe to group sync jobs
  useEffect(() => {
    if (!isConnected) return

    const syncChannel = subscribe('group_sync_jobs', (payload) => {
      console.log('Group sync update:', payload)

      if (payload.eventType === 'UPDATE' && payload.new) {
        const job = payload.new as {
          status?: string
          group_id?: string
          participant_count?: number
        }
        if (
          job.status === 'completed' &&
          job.group_id &&
          job.participant_count
        ) {
          onGroupSynced?.(job.group_id, job.participant_count)
          toast.success(
            `Grupo sincronizado: ${job.participant_count} participantes`
          )
        } else if (job.status === 'failed') {
          toast.error('Falha ao sincronizar grupo')
        }
      }
    })

    setChannels((prev) => [...prev, syncChannel])

    return () => {
      unsubscribe(syncChannel)
      setChannels((prev) => prev.filter((c) => c !== syncChannel))
    }
  }, [isConnected, onGroupSynced, subscribe, unsubscribe])

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
