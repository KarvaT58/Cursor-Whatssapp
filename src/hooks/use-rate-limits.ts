import { useState, useEffect, useCallback } from 'react'

interface RateLimitInfo {
  remaining: number
  limit: number
  window: string
}

interface RateLimits {
  whatsapp: RateLimitInfo
  campaign: RateLimitInfo
  api: RateLimitInfo
}

interface UseRateLimitsOptions {
  refreshInterval?: number // in milliseconds
  enabled?: boolean
}

export function useRateLimits(options: UseRateLimitsOptions = {}) {
  const { refreshInterval = 30000, enabled = true } = options
  const [rateLimits, setRateLimits] = useState<RateLimits | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRateLimits = useCallback(async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/rate-limits')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setRateLimits(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch rate limits'
      setError(errorMessage)
      console.error('Error fetching rate limits:', err)
    } finally {
      setIsLoading(false)
    }
  }, [enabled])

  // Initial fetch
  useEffect(() => {
    fetchRateLimits()
  }, [fetchRateLimits])

  // Set up polling
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(fetchRateLimits, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchRateLimits, refreshInterval, enabled])

  const refresh = useCallback(() => {
    fetchRateLimits()
  }, [fetchRateLimits])

  const getUsagePercentage = useCallback(
    (service: keyof RateLimits) => {
      if (!rateLimits) return 0
      const limit = rateLimits[service]
      return ((limit.limit - limit.remaining) / limit.limit) * 100
    },
    [rateLimits]
  )

  const isNearLimit = useCallback(
    (service: keyof RateLimits, threshold = 0.8) => {
      if (!rateLimits) return false
      const limit = rateLimits[service]
      return (limit.limit - limit.remaining) / limit.limit >= threshold
    },
    [rateLimits]
  )

  const isAtLimit = useCallback(
    (service: keyof RateLimits) => {
      if (!rateLimits) return false
      return rateLimits[service].remaining === 0
    },
    [rateLimits]
  )

  return {
    rateLimits,
    isLoading,
    error,
    refresh,
    getUsagePercentage,
    isNearLimit,
    isAtLimit,
  }
}
