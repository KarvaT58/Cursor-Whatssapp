import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useIntelligentCache } from '../use-intelligent-cache'

describe('useIntelligentCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with default options', () => {
    const { result } = renderHook(() => useIntelligentCache())

    expect(result.current.stats).toEqual({
      hits: 0,
      misses: 0,
      size: 0,
      entries: 0,
      hitRate: 0,
    })
  })

  it('should set and get values', () => {
    const { result } = renderHook(() => useIntelligentCache())

    act(() => {
      result.current.set('key1', 'value1')
    })

    const value = result.current.get('key1')
    expect(value).toBe('value1')
    expect(result.current.stats.hits).toBe(1)
    expect(result.current.stats.entries).toBe(1)
  })

  it('should handle cache misses', () => {
    const { result } = renderHook(() => useIntelligentCache())

    const value = result.current.get('nonexistent')
    expect(value).toBeUndefined()
    expect(result.current.stats.misses).toBe(1)
    expect(result.current.stats.hitRate).toBe(0)
  })

  it('should respect TTL expiration', () => {
    const { result } = renderHook(() =>
      useIntelligentCache({ defaultTtl: 100 })
    )

    act(() => {
      result.current.set('key1', 'value1', 50) // Custom TTL
    })

    expect(result.current.get('key1')).toBe('value1')

    act(() => {
      vi.advanceTimersByTime(60)
    })

    // Trigger cleanup by calling get
    const value = result.current.get('key1')
    expect(value).toBeUndefined()
    expect(result.current.stats.misses).toBe(1)
  })

  it('should respect maxAge expiration', () => {
    const { result } = renderHook(() => useIntelligentCache({ maxAge: 100 }))

    act(() => {
      result.current.set('key1', 'value1')
    })

    expect(result.current.get('key1')).toBe('value1')

    act(() => {
      vi.advanceTimersByTime(150)
    })

    // Trigger cleanup by calling get
    const value = result.current.get('key1')
    expect(value).toBeUndefined()
  })

  it('should enforce maxSize limit', () => {
    const { result } = renderHook(() => useIntelligentCache({ maxSize: 2 }))

    act(() => {
      result.current.set('key1', 'value1')
      result.current.set('key2', 'value2')
      result.current.set('key3', 'value3') // Should evict key1
    })

    expect(result.current.get('key1')).toBeUndefined()
    expect(result.current.get('key2')).toBe('value2')
    expect(result.current.get('key3')).toBe('value3')
    expect(result.current.stats.entries).toBe(2)
  })

  it('should remove specific keys', () => {
    const { result } = renderHook(() => useIntelligentCache())

    act(() => {
      result.current.set('key1', 'value1')
      result.current.set('key2', 'value2')
    })

    const removed = result.current.delete('key1')
    expect(removed).toBe(true)
    expect(result.current.get('key1')).toBeUndefined()
    expect(result.current.get('key2')).toBe('value2')
    expect(result.current.stats.entries).toBe(1)
  })

  it('should clear all entries', () => {
    const { result } = renderHook(() => useIntelligentCache())

    act(() => {
      result.current.set('key1', 'value1')
      result.current.set('key2', 'value2')
    })

    act(() => {
      result.current.clear()
    })

    expect(result.current.get('key1')).toBeUndefined()
    expect(result.current.get('key2')).toBeUndefined()
    expect(result.current.stats.entries).toBe(0)
    expect(result.current.stats.hits).toBe(0)
    expect(result.current.stats.misses).toBe(0)
  })

  it('should calculate hit rate correctly', () => {
    const { result } = renderHook(() => useIntelligentCache())

    act(() => {
      result.current.set('key1', 'value1')
    })

    // Hit
    result.current.get('key1')
    // Miss
    result.current.get('key2')
    // Hit
    result.current.get('key1')

    expect(result.current.stats.hits).toBe(2)
    expect(result.current.stats.misses).toBe(1)
    expect(result.current.stats.hitRate).toBe(66.67)
  })

  it('should run periodic cleanup', () => {
    const { result } = renderHook(() =>
      useIntelligentCache({
        defaultTtl: 100,
        cleanupInterval: 50,
      })
    )

    act(() => {
      result.current.set('key1', 'value1')
    })

    act(() => {
      vi.advanceTimersByTime(60) // Past TTL
    })

    // Trigger cleanup interval
    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(result.current.get('key1')).toBeUndefined()
  })

  it('should handle complex data types', () => {
    const { result } = renderHook(() => useIntelligentCache())

    const complexData = {
      id: 1,
      name: 'Test',
      items: ['item1', 'item2'],
      metadata: { created: new Date() },
    }

    act(() => {
      result.current.set('complex', complexData)
    })

    const retrieved = result.current.get('complex')
    expect(retrieved).toEqual(complexData)
  })

  it('should update stats when entries are evicted', () => {
    const { result } = renderHook(() => useIntelligentCache({ maxSize: 1 }))

    act(() => {
      result.current.set('key1', 'value1')
      result.current.set('key2', 'value2') // Should evict key1
    })

    // Try to get evicted key
    result.current.get('key1')

    expect(result.current.stats.misses).toBe(1)
    expect(result.current.stats.entries).toBe(1)
  })
})
