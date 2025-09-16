import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntelligentCache } from '../use-intelligent-cache'

describe('useIntelligentCache', () => {
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
  })

  it('should handle cache misses', () => {
    const { result } = renderHook(() => useIntelligentCache())

    const value = result.current.get('nonexistent')
    expect(value).toBeUndefined()
  })

  it('should clear all entries', () => {
    const { result } = renderHook(() => useIntelligentCache())

    act(() => {
      result.current.set('key1', 'value1')
      result.current.clear()
    })

    const value = result.current.get('key1')
    expect(value).toBeUndefined()
  })
})
