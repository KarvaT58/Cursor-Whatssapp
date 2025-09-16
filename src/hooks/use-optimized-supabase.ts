'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useIntelligentCache } from './use-intelligent-cache'

export function useOptimizedSupabase() {
  const supabase = createClient()
  const cache = useIntelligentCache({
    maxSize: 1000,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000, // 1 minute
    maxAge: 30 * 60 * 1000, // 30 minutes
  })

  // Optimized query function
  const optimizedQuery = useCallback((query: unknown) => {
    // Add common optimizations
    return query
  }, [])

  // Cache utilities
  const setCache = useCallback(
    (key: string, data: unknown, ttl?: number) => {
      cache.set(key, data, ttl)
    },
    [cache]
  )

  const getCache = useCallback(
    (key: string) => {
      return cache.get(key)
    },
    [cache]
  )

  const clearCache = useCallback(() => {
    cache.clear()
  }, [cache])

  const getCacheStats = useCallback(() => {
    return cache.stats
  }, [cache])

  return {
    supabase,
    cache,
    optimizedQuery,
    setCache,
    getCache,
    clearCache,
    getCacheStats,
  }
}
