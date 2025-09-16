'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import {
  Campaign,
  CampaignWithContacts,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignFilters,
  CampaignListResponse,
  CampaignMetrics,
} from '@/types/campaigns'

export function useCampaigns() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignWithContacts[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null)

  const fetchCampaigns = useCallback(
    async (filters?: CampaignFilters) => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.search) params.append('search', filters.search)
        if (filters?.date_from) params.append('date_from', filters.date_from)
        if (filters?.date_to) params.append('date_to', filters.date_to)

        const response = await fetch(`/api/campaigns?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns')
        }

        const data: CampaignListResponse = await response.json()
        setCampaigns(data.campaigns)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const fetchCampaign = useCallback(
    async (id: string): Promise<CampaignWithContacts | null> => {
      if (!user) return null

      try {
        const response = await fetch(`/api/campaigns/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch campaign')
        }

        return await response.json()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return null
      }
    },
    [user]
  )

  const createCampaign = useCallback(
    async (data: CreateCampaignData): Promise<Campaign | null> => {
      if (!user) return null

      try {
        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to create campaign')
        }

        const newCampaign = await response.json()
        setCampaigns((prev) => [newCampaign, ...prev])
        return newCampaign
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return null
      }
    },
    [user]
  )

  const updateCampaign = useCallback(
    async (id: string, data: UpdateCampaignData): Promise<Campaign | null> => {
      if (!user) return null

      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update campaign')
        }

        const updatedCampaign = await response.json()
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? updatedCampaign : c))
        )
        return updatedCampaign
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return null
      }
    },
    [user]
  )

  const deleteCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false

      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete campaign')
        }

        setCampaigns((prev) => prev.filter((c) => c.id !== id))
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return false
      }
    },
    [user]
  )

  const startCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false

      try {
        const response = await fetch(`/api/campaigns/${id}/start`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to start campaign')
        }

        // Refresh campaigns to get updated status
        await fetchCampaigns()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return false
      }
    },
    [user, fetchCampaigns]
  )

  const pauseCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false

      try {
        const response = await fetch(`/api/campaigns/${id}/pause`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to pause campaign')
        }

        // Refresh campaigns to get updated status
        await fetchCampaigns()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return false
      }
    },
    [user, fetchCampaigns]
  )

  const stopCampaign = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false

      try {
        const response = await fetch(`/api/campaigns/${id}/stop`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to stop campaign')
        }

        // Refresh campaigns to get updated status
        await fetchCampaigns()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        return false
      }
    },
    [user, fetchCampaigns]
  )

  const fetchMetrics = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/campaigns/metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch campaign metrics')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      console.error('Error fetching campaign metrics:', err)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchCampaigns()
      fetchMetrics()
    }
  }, [user, fetchCampaigns, fetchMetrics])

  return {
    campaigns,
    loading,
    error,
    metrics,
    fetchCampaigns,
    fetchCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    stopCampaign,
    fetchMetrics,
  }
}
