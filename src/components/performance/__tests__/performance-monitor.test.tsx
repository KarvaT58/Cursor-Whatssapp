import { render, screen, fireEvent } from '@/test/test-utils'
import { PerformanceMonitor } from '../performance-monitor'

import { vi } from 'vitest'

// Mock the performance API
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
  },
}

Object.defineProperty(window, 'performance', {
  writable: true,
  value: mockPerformance,
})

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render performance monitor', () => {
    render(<PerformanceMonitor />)

    expect(screen.getByText('Performance')).toBeInTheDocument()
  })

  it('should show expand/collapse button', () => {
    render(<PerformanceMonitor />)

    const expandButton = screen.getByRole('button', { name: /expand/i })
    expect(expandButton).toBeInTheDocument()
  })

  it('should toggle expanded state when button is clicked', () => {
    render(<PerformanceMonitor />)

    const expandButton = screen.getByRole('button', { name: /expand/i })

    // Initially collapsed
    expect(screen.queryByText('Memory Usage')).not.toBeInTheDocument()

    // Click to expand
    fireEvent.click(expandButton)
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()

    // Click to collapse
    fireEvent.click(expandButton)
    expect(screen.queryByText('Memory Usage')).not.toBeInTheDocument()
  })

  it('should show refresh button', () => {
    render(<PerformanceMonitor />)

    const refreshButton = screen.getByRole('button', { name: /refresh/i })
    expect(refreshButton).toBeInTheDocument()
  })

  it('should display performance metrics when expanded', () => {
    render(<PerformanceMonitor showDetails />)

    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
    expect(screen.getByText('Network')).toBeInTheDocument()
    expect(screen.getByText('Cache Performance')).toBeInTheDocument()
  })

  it('should display memory usage percentage', () => {
    render(<PerformanceMonitor showDetails />)

    // Memory usage should be 50% (1000000 / 2000000)
    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<PerformanceMonitor className="custom-class" />)

    const monitor = screen.getByText('Performance').closest('.custom-class')
    expect(monitor).toBeInTheDocument()
  })

  it('should update metrics on refresh button click', () => {
    render(<PerformanceMonitor showDetails />)

    const refreshButton = screen.getByRole('button', { name: /refresh/i })

    // Mock different memory values
    mockPerformance.memory.usedJSHeapSize = 1500000
    mockPerformance.memory.totalJSHeapSize = 2000000

    fireEvent.click(refreshButton)

    // Should show 75% memory usage
    expect(screen.getByText('75.0%')).toBeInTheDocument()
  })

  it('should handle missing performance.memory gracefully', () => {
    // Remove memory property
    delete (window.performance as { memory?: unknown }).memory

    render(<PerformanceMonitor showDetails />)

    // Should still render without crashing
    expect(screen.getByText('Memory Usage')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })

  it('should use custom refresh interval', () => {
    vi.useFakeTimers()

    render(<PerformanceMonitor refreshInterval={2000} />)

    // Fast-forward time
    vi.advanceTimersByTime(2000)

    // Should have called performance.now multiple times
    expect(mockPerformance.now).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('should show progress bars for metrics', () => {
    render(<PerformanceMonitor showDetails />)

    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBeGreaterThan(0) // At least one progress bar
  })

  it('should display metric values with proper formatting', () => {
    render(<PerformanceMonitor showDetails />)

    // Check that values are displayed with proper decimal places
    expect(screen.getByText(/^\d+\.\d+%$/)).toBeInTheDocument() // Percentage format
    expect(screen.getByText(/^\d+\.\d+ms$/)).toBeInTheDocument() // Time format
  })
})
