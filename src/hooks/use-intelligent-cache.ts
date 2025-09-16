'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheOptions {
  maxSize: number
  defaultTtl: number
  cleanupInterval: number
  maxAge: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  entries: number
  hitRate: number
}

export function useIntelligentCache<T = unknown>(options: CacheOptions) {
  const {
    maxSize = 100,
    defaultTtl = 5 * 60 * 1000, // 5 minutes
    cleanupInterval = 60 * 1000, // 1 minute
    maxAge = 30 * 60 * 1000, // 30 minutes
  } = options

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const statsRef = useRef<CacheStats>({
    hits: 0,
    misses: 0,
    size: 0,
    entries: 0,
    hitRate: 0,
  })

  const [stats, setStats] = useState<CacheStats>(statsRef.current)

  // Calculate cache entry size
  const calculateSize = useCallback((data: T): number => {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 0
    }
  }, [])

  // Update cache statistics
  const updateStats = useCallback(() => {
    const cache = cacheRef.current
    const currentStats = statsRef.current

    currentStats.entries = cache.size
    currentStats.size = Array.from(cache.values()).reduce(
      (total, entry) => total + entry.size,
      0
    )
    currentStats.hitRate =
      currentStats.hits / (currentStats.hits + currentStats.misses) || 0

    setStats({ ...currentStats })
  }, [])

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    const cache = cacheRef.current
    const now = Date.now()
    const entriesToDelete: string[] = []

    for (const [key, entry] of cache.entries()) {
      const isExpired = now - entry.timestamp > entry.ttl
      const isTooOld = now - entry.timestamp > maxAge

      if (isExpired || isTooOld) {
        entriesToDelete.push(key)
      }
    }

    entriesToDelete.forEach((key) => cache.delete(key))
    updateStats()
  }, [maxAge, updateStats])

  // Evict least recently used entries
  const evictLRU = useCallback(() => {
    const cache = cacheRef.current
    const entries = Array.from(cache.entries())

    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)

    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25)
    for (let i = 0; i < toRemove; i++) {
      cache.delete(entries[i][0])
    }

    updateStats()
  }, [updateStats])

  // Check if cache is full
  const isCacheFull = useCallback(() => {
    const cache = cacheRef.current
    return cache.size >= maxSize
  }, [maxSize])

  // Get value from cache
  const get = useCallback(
    (key: string): T | null => {
      const cache = cacheRef.current
      const entry = cache.get(key)

      if (!entry) {
        statsRef.current.misses++
        updateStats()
        return null
      }

      const now = Date.now()
      const isExpired = now - entry.timestamp > entry.ttl

      if (isExpired) {
        cache.delete(key)
        statsRef.current.misses++
        updateStats()
        return null
      }

      // Update access statistics
      entry.accessCount++
      entry.lastAccessed = now
      statsRef.current.hits++
      updateStats()

      return entry.data
    },
    [updateStats]
  )

  // Set value in cache
  const set = useCallback(
    (key: string, data: T, ttl?: number): void => {
      const cache = cacheRef.current
      const now = Date.now()
      const entrySize = calculateSize(data)

      // Check if we need to evict entries
      if (isCacheFull()) {
        evictLRU()
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        ttl: ttl || defaultTtl,
        accessCount: 0,
        lastAccessed: now,
        size: entrySize,
      }

      cache.set(key, entry)
      updateStats()
    },
    [calculateSize, isCacheFull, evictLRU, defaultTtl, updateStats]
  )

  // Delete value from cache
  const del = useCallback(
    (key: string): boolean => {
      const cache = cacheRef.current
      const deleted = cache.delete(key)
      if (deleted) {
        updateStats()
      }
      return deleted
    },
    [updateStats]
  )

  // Clear all cache entries
  const clear = useCallback(() => {
    cacheRef.current.clear()
    statsRef.current = {
      hits: 0,
      misses: 0,
      size: 0,
      entries: 0,
      hitRate: 0,
    }
    updateStats()
  }, [updateStats])

  // Check if key exists in cache
  const has = useCallback(
    (key: string): boolean => {
      const cache = cacheRef.current
      const entry = cache.get(key)

      if (!entry) return false

      const now = Date.now()
      const isExpired = now - entry.timestamp > entry.ttl

      if (isExpired) {
        cache.delete(key)
        updateStats()
        return false
      }

      return true
    },
    [updateStats]
  )

  // Get cache keys
  const keys = useCallback((): string[] => {
    return Array.from(cacheRef.current.keys())
  }, [])

  // Get cache size in bytes
  const getSize = useCallback((): number => {
    return statsRef.current.size
  }, [])

  // Get cache entry count
  const getEntryCount = useCallback((): number => {
    return statsRef.current.entries
  }, [])

  // Get cache hit rate
  const getHitRate = useCallback((): number => {
    return statsRef.current.hitRate
  }, [])

  // Setup cleanup interval
  useEffect(() => {
    const interval = setInterval(cleanup, cleanupInterval)
    return () => clearInterval(interval)
  }, [cleanup, cleanupInterval])

  return {
    get,
    set,
    delete: del,
    clear,
    has,
    keys,
    getSize,
    getEntryCount,
    getHitRate,
    stats,
    cleanup,
  }
}

// Hook for caching API responses
export function useApiCache<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    staleWhileRevalidate?: boolean
    retryCount?: number
    retryDelay?: number
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = true,
    retryCount = 3,
    retryDelay = 1000,
  } = options

  const cache = useIntelligentCache<T>({
    maxSize: 1000,
    defaultTtl: ttl,
    cleanupInterval: 60 * 1000,
    maxAge: 30 * 60 * 1000,
  })

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        const cachedData = cache.get(cacheKey)
        if (cachedData) {
          setData(cachedData)
          setError(null)

          if (staleWhileRevalidate) {
            // Return cached data immediately, but fetch fresh data in background
            try {
              const freshData = await fetcher()
              cache.set(cacheKey, freshData, ttl)
              setData(freshData)
            } catch (err) {
              // Ignore background fetch errors
              console.warn('Background fetch failed:', err)
            }
          }
          return
        }
      }

      setIsLoading(true)
      setError(null)

      let attempts = 0
      while (attempts < retryCount) {
        try {
          const result = await fetcher()
          cache.set(cacheKey, result, ttl)
          setData(result)
          setIsLoading(false)
          return
        } catch (err) {
          attempts++
          if (attempts >= retryCount) {
            setError(
              err instanceof Error ? err : new Error('Failed to fetch data')
            )
            setIsLoading(false)
            return
          }
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * attempts)
          )
        }
      }
    },
    [
      cache,
      cacheKey,
      fetcher,
      ttl,
      staleWhileRevalidate,
      retryCount,
      retryDelay,
    ]
  )

  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(cacheKey)
    setData(null)
  }, [cache, cacheKey])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    cacheStats: cache.stats,
  }
}
