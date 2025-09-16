import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import {
  useOptimizedDebounce,
  useDebouncedValue,
  useDebouncedCallback,
} from '../use-optimized-debounce'

describe('useOptimizedDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce function calls', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100 })
    )

    act(() => {
      result.current('arg1')
      result.current('arg2')
      result.current('arg3')
    })

    expect(mockFn).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenLastCalledWith('arg3')
  })

  it('should support leading edge execution', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100, leading: true })
    )

    act(() => {
      result.current('arg1')
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg1')

    act(() => {
      result.current('arg2')
    })

    expect(mockFn).toHaveBeenCalledTimes(1) // Still only called once

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(mockFn).toHaveBeenLastCalledWith('arg2')
  })

  it('should support maxWait option', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100, maxWait: 200 })
    )

    act(() => {
      result.current('arg1')
    })

    act(() => {
      vi.advanceTimersByTime(50)
      result.current('arg2')
    })

    act(() => {
      vi.advanceTimersByTime(50)
      result.current('arg3')
    })

    act(() => {
      vi.advanceTimersByTime(100) // Total 200ms, should trigger maxWait
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg3')
  })

  it('should provide cancel functionality', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100 })
    )

    act(() => {
      result.current('arg1')
      result.current.cancel()
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockFn).not.toHaveBeenCalled()
  })

  it('should provide flush functionality', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100 })
    )

    act(() => {
      result.current('arg1')
      result.current.flush()
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(mockFn).toHaveBeenCalledWith('arg1')
  })

  it('should provide pending status', () => {
    const mockFn = vi.fn()
    const { result } = renderHook(() =>
      useOptimizedDebounce(mockFn, { delay: 100 })
    )

    act(() => {
      result.current('arg1')
    })

    expect(result.current.pending()).toBe(true)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.pending()).toBe(false)
  })
})

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated1' })
    rerender({ value: 'updated2' })
    rerender({ value: 'updated3' })

    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('updated3')
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce callback execution', () => {
    const mockCallback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(mockCallback, 100))

    act(() => {
      result.current('arg1')
      result.current('arg2')
      result.current('arg3')
    })

    expect(mockCallback).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
    expect(mockCallback).toHaveBeenCalledWith('arg3')
  })

  it('should handle dependency changes', () => {
    const mockCallback1 = vi.fn()
    const mockCallback2 = vi.fn()

    const { result, rerender } = renderHook(
      ({ callback }) => useDebouncedCallback(callback, 100),
      { initialProps: { callback: mockCallback1 } }
    )

    act(() => {
      result.current('arg1')
    })

    rerender({ callback: mockCallback2 })

    act(() => {
      result.current('arg2')
    })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(mockCallback1).not.toHaveBeenCalled()
    expect(mockCallback2).toHaveBeenCalledTimes(1)
    expect(mockCallback2).toHaveBeenCalledWith('arg2')
  })
})
