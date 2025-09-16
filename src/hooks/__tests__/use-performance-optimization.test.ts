import { renderHook, act } from '@testing-library/react'
import { vi } from 'vitest'
import { usePerformanceOptimization } from '../use-performance-optimization'

// Mock the intelligent cache hook
vi.mock('../use-intelligent-cache', () => ({
  useIntelligentCache: () => ({
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
    stats: {
      hits: 10,
      misses: 5,
      size: 1024,
      entries: 15,
      hitRate: 66.67,
    },
  }),
}))

// Mock the optimized debounce hook
vi.mock('../use-optimized-debounce', () => ({
  useOptimizedDebounce: (fn: (...args: unknown[]) => unknown) => fn,
}))

describe('usePerformanceOptimization', () => {
  beforeEach(() => {
    // Reset performance mock
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
        },
      },
    })
  })

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    expect(result.current.metrics).toEqual({
      renderTime: 0,
      memoryUsage: 0,
      networkLatency: 0,
      cacheHitRate: 0,
      bundleSize: 0,
      queryTime: 0,
    })
    expect(result.current.recommendations).toEqual([])
    expect(result.current.isOptimized).toBe(false)
    expect(result.current.score).toBe(0)
  })

  it('should start and stop render timing', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    act(() => {
      result.current.startRenderTiming()
    })

    act(() => {
      result.current.endRenderTiming()
    })

    expect(result.current.metrics.renderTime).toBeGreaterThan(0)
  })

  it('should start and stop query timing', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    act(() => {
      result.current.startQueryTiming()
    })

    act(() => {
      result.current.endQueryTiming()
    })

    expect(result.current.metrics.queryTime).toBeGreaterThan(0)
  })

  it('should calculate memory usage correctly', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    act(() => {
      result.current.updateMetrics()
    })

    // Memory usage should be 50% (1000000 / 2000000)
    expect(result.current.metrics.memoryUsage).toBe(50)
  })

  it('should generate recommendations for high memory usage', () => {
    // Mock high memory usage
    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        now: jest.fn(() => Date.now()),
        memory: {
          usedJSHeapSize: 1800000, // 90% usage
          totalJSHeapSize: 2000000,
        },
      },
    })

    const { result } = renderHook(() =>
      usePerformanceOptimization({ memoryThreshold: 80 })
    )

    act(() => {
      result.current.updateMetrics()
    })

    expect(result.current.recommendations).toContain(
      'High memory usage detected. Consider implementing lazy loading and memory cleanup.'
    )
  })

  it('should calculate performance score correctly', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    act(() => {
      result.current.updateMetrics()
    })

    // With default metrics, score should be calculated
    expect(result.current.score).toBeGreaterThanOrEqual(0)
    expect(result.current.score).toBeLessThanOrEqual(100)
  })

  it('should optimize component with React.memo', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    const TestComponent = () => React.createElement('div', null, 'Test')
    const optimizedComponent = result.current.optimizeComponent(TestComponent)

    expect(optimizedComponent).toBeDefined()
  })

  it('should handle cache operations', () => {
    const { result } = renderHook(() => usePerformanceOptimization())

    act(() => {
      result.current.optimizeCache('test-key', { data: 'test' }, 5000)
    })

    const cachedData = result.current.getCache('test-key')
    expect(cachedData).toBeDefined()

    act(() => {
      result.current.clearCache()
    })
  })

  it('should handle different optimization options', () => {
    const { result } = renderHook(() =>
      usePerformanceOptimization({
        enableMemoryMonitoring: false,
        enableNetworkMonitoring: false,
        memoryThreshold: 90,
        networkThreshold: 1000,
        cacheThreshold: 0.9,
      })
    )

    expect(result.current.metrics).toBeDefined()
  })
})
