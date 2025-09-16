'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Campaign = Database['public']['Tables']['campaigns']['Row']

export function useRealtimeCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const supabase = createClient()

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Usuário não autenticado')
        }

        const { data, error: fetchError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        setCampaigns(data || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar campanhas'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [supabase])

  useEffect(() => {
    if (!isConnected) return

    const channel = subscribe('campaigns', (payload) => {
      console.log('Mudança em campanhas:', payload)

      if (payload.eventType === 'INSERT') {
        const newCampaign = payload.new as Campaign
        setCampaigns((prev) => [newCampaign, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        const updatedCampaign = payload.new as Campaign
        setCampaigns((prev) =>
          prev.map((campaign) =>
            campaign.id === updatedCampaign.id ? updatedCampaign : campaign
          )
        )
      } else if (payload.eventType === 'DELETE') {
        const deletedCampaign = payload.old as Campaign
        setCampaigns((prev) =>
          prev.filter((campaign) => campaign.id !== deletedCampaign.id)
        )
      }
    })

    return () => {
      unsubscribe(channel)
    }
  }, [isConnected, subscribe, unsubscribe])

  const createCampaign = async (
    campaignData: Omit<
      Campaign,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'user_id'
      | 'status'
      | 'started_at'
      | 'completed_at'
      | 'stats'
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          user_id: user.id,
          status: 'draft',
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha')
      throw err
    }
  }

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao atualizar campanha'
      )
      throw err
    }
  }

  const deleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id)

      if (error) {
        throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar campanha')
      throw err
    }
  }

  const startCampaign = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          status: 'running',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar campanha')
      throw err
    }
  }

  const completeCampaign = async (
    id: string,
    stats?: Record<string, unknown>
  ) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          stats: stats || null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao completar campanha'
      )
      throw err
    }
  }

  return {
    campaigns,
    loading,
    error,
    isConnected,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    completeCampaign,
  }
}
