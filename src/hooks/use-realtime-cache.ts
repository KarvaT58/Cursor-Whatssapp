'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface UseRealtimeCacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number
}

export function useRealtimeCache<T>(
  key: string,
  options: UseRealtimeCacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options // 5 minutes default TTL
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map())

  // Clean expired entries
  const cleanExpired = useCallback(() => {
    const now = Date.now()
    const newCache = new Map(cacheRef.current)

    for (const [key, entry] of newCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        newCache.delete(key)
      }
    }

    cacheRef.current = newCache
    setCache(newCache)
  }, [])

  // Set data in cache
  const set = useCallback(
    (data: T, customTtl?: number) => {
      const now = Date.now()
      const entry: CacheEntry<T> = {
        data,
        timestamp: now,
        ttl: customTtl || ttl,
      }

      // Remove oldest entries if cache is full
      if (cacheRef.current.size >= maxSize) {
        const oldestKey = cacheRef.current.keys().next().value
        if (oldestKey) {
          cacheRef.current.delete(oldestKey)
        }
      }

      cacheRef.current.set(key, entry)
      setCache(new Map(cacheRef.current))
    },
    [key, ttl, maxSize]
  )

  // Get data from cache
  const get = useCallback((): T | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key)
      setCache(new Map(cacheRef.current))
      return null
    }

    return entry.data
  }, [key])

  // Check if data exists and is valid
  const has = useCallback((): boolean => {
    const entry = cacheRef.current.get(key)
    if (!entry) return false

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key)
      setCache(new Map(cacheRef.current))
      return false
    }

    return true
  }, [key])

  // Remove specific entry
  const remove = useCallback(() => {
    cacheRef.current.delete(key)
    setCache(new Map(cacheRef.current))
  }, [key])

  // Clear all cache
  const clear = useCallback(() => {
    cacheRef.current.clear()
    setCache(new Map())
  }, [])

  // Get cache stats
  const getStats = useCallback(() => {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const entry of cacheRef.current.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++
      } else {
        validEntries++
      }
    }

    return {
      total: cacheRef.current.size,
      valid: validEntries,
      expired: expiredEntries,
      maxSize,
    }
  }, [maxSize])

  // Clean expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanExpired, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cleanExpired])

  return {
    set,
    get,
    has,
    remove,
    clear,
    getStats,
    cache: cacheRef.current,
  }
}
