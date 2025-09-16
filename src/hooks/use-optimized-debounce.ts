'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

interface DebounceOptions {
  delay: number
  maxWait?: number
  leading?: boolean
  trailing?: boolean
}

interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
  pending: () => boolean
}

export function useOptimizedDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  options: DebounceOptions
): DebouncedFunction<T> {
  const {
    delay,
    maxWait = delay * 2,
    leading = false,
    trailing = true,
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastCallTimeRef = useRef<number>(0)
  const lastInvokeTimeRef = useRef<number>(0)
  const lastArgsRef = useRef<Parameters<T> | undefined>(undefined)
  const resultRef = useRef<ReturnType<T> | undefined>(undefined)

  const invokeFunc = useCallback(
    (time: number) => {
      const args = lastArgsRef.current!
      lastInvokeTimeRef.current = time
      resultRef.current = func(...args) as ReturnType<T>
      return resultRef.current
    },
    [func]
  )

  const leadingEdge = useCallback(
    (time: number) => {
      lastInvokeTimeRef.current = time
      timeoutRef.current = setTimeout(timerExpired, delay)
      return leading ? invokeFunc(time) : resultRef.current
    },
    [delay, leading, invokeFunc]
  )

  const remainingWait = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current
      const timeWaiting = delay - timeSinceLastCall

      return timeSinceLastInvoke >= maxWait
        ? 0
        : Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
    },
    [delay, maxWait]
  )

  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - lastCallTimeRef.current
      const timeSinceLastInvoke = time - lastInvokeTimeRef.current

      return (
        lastCallTimeRef.current === 0 ||
        timeSinceLastCall >= delay ||
        timeSinceLastCall < 0 ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      )
    },
    [delay, maxWait]
  )

  const trailingEdge = useCallback(
    (time: number) => {
      timeoutRef.current = undefined
      if (trailing && lastArgsRef.current) {
        return invokeFunc(time)
      }
      lastArgsRef.current = undefined
      lastCallTimeRef.current = 0
      return resultRef.current
    },
    [trailing, invokeFunc]
  )

  const timerExpired = useCallback(() => {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timeoutRef.current = setTimeout(timerExpired, remainingWait(time))
  }, [shouldInvoke, trailingEdge, remainingWait])

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current)
    }
    if (maxTimeoutRef.current !== undefined) {
      clearTimeout(maxTimeoutRef.current)
    }
    lastInvokeTimeRef.current = 0
    lastCallTimeRef.current = 0
    lastArgsRef.current = undefined
    timeoutRef.current = undefined
    maxTimeoutRef.current = undefined
  }, [])

  const flush = useCallback(() => {
    return timeoutRef.current === undefined
      ? resultRef.current
      : trailingEdge(Date.now())
  }, [trailingEdge])

  const pending = useCallback(() => {
    return timeoutRef.current !== undefined
  }, [])

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      const time = Date.now()
      const isInvoking = shouldInvoke(time)

      lastArgsRef.current = args
      lastCallTimeRef.current = time

      if (isInvoking) {
        if (timeoutRef.current === undefined) {
          return leadingEdge(time)
        }
        if (maxWait) {
          timeoutRef.current = setTimeout(timerExpired, delay)
          return invokeFunc(time)
        }
      }
      if (timeoutRef.current === undefined) {
        timeoutRef.current = setTimeout(timerExpired, delay)
      }
    },
    [shouldInvoke, leadingEdge, maxWait, timerExpired, delay, invokeFunc]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  // Add methods to the debounced function
  Object.assign(debounced, {
    cancel,
    flush,
    pending,
  })

  return debounced as DebouncedFunction<T>
}

// Hook for debouncing values
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for debouncing callbacks with immediate execution option
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay, ...deps]
  ) as T

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}
