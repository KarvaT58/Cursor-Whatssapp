'use client'

import { useCallback, useRef } from 'react'

interface UseRealtimeDebounceOptions {
  delay?: number
  maxWait?: number
}

export function useRealtimeDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  options: UseRealtimeDebounceOptions = {}
): T {
  const { delay = 300, maxWait = 1000 } = options
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastCallRef = useRef<number>(0)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set max wait timeout if not already set
      if (!maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          callback(...args)
          maxTimeoutRef.current = undefined
          lastCallRef.current = now
        }, maxWait)
      }

      // Set regular debounce timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current)
          maxTimeoutRef.current = undefined
        }
        lastCallRef.current = now
      }, delay)
    },
    [callback, delay, maxWait]
  ) as T

  return debouncedCallback
}
