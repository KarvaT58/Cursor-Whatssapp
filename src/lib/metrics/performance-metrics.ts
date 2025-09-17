import logger from '@/lib/logging/logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
  [key: string]: unknown
}

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  delta: number
  id: string
  navigationType: string
}

class PerformanceMetrics {
  private metrics: PerformanceMetric[] = []
  private readonly maxMetrics = 1000

  recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags,
    }

    this.metrics.push(metric)

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log important metrics
    if (value > 1000 || name.includes('error')) {
      logger.info('Performance Metric', metric)
    }
  }

  recordWebVitals(metric: WebVitalsMetric) {
    this.recordMetric(
      `web-vitals.${metric.name.toLowerCase()}`,
      metric.value,
      'ms',
      {
        navigationType: metric.navigationType,
        id: metric.id,
      }
    )
  }

  recordApiCall(endpoint: string, duration: number, statusCode: number, method: string) {
    this.recordMetric('api.call.duration', duration, 'ms', {
      endpoint,
      status: statusCode.toString(),
      method,
    })

    this.recordMetric('api.call.count', 1, 'count', {
      endpoint,
      status: statusCode.toString(),
      method,
    })
  }

  recordDatabaseQuery(table: string, duration: number, operation: string) {
    this.recordMetric('database.query.duration', duration, 'ms', {
      table,
      operation,
    })

    this.recordMetric('database.query.count', 1, 'count', {
      table,
      operation,
    })
  }

  recordRealtimeEvent(eventType: string, duration: number) {
    this.recordMetric('realtime.event.duration', duration, 'ms', {
      eventType,
    })

    this.recordMetric('realtime.event.count', 1, 'count', {
      eventType,
    })
  }

  recordCampaignMetric(campaignId: string, metric: string, value: number) {
    this.recordMetric(`campaign.${metric}`, value, 'count', {
      campaignId,
    })
  }

  recordUserAction(userId: string, action: string, duration: number) {
    this.recordMetric('user.action.duration', duration, 'ms', {
      userId,
      action,
    })
  }

  recordError(error: string, count: number = 1) {
    this.recordMetric('error.count', count, 'count', {
      error,
    })
  }

  getMetrics(name?: string, tags?: Record<string, string>): PerformanceMetric[] {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter((m) => m.name === name)
    }

    if (tags) {
      filtered = filtered.filter((m) => {
        return Object.entries(tags).every(([key, value]) => 
          m.tags?.[key] === value
        )
      })
    }

    return filtered
  }

  getAverageMetric(name: string, timeWindow?: number): number {
    const now = Date.now()
    const cutoff = timeWindow ? now - timeWindow : 0

    const metrics = this.metrics.filter((m) => {
      if (m.name !== name) return false
      if (timeWindow && m.timestamp.getTime() < cutoff) return false
      return true
    })

    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  getMetricCount(name: string, timeWindow?: number): number {
    const now = Date.now()
    const cutoff = timeWindow ? now - timeWindow : 0

    return this.metrics.filter((m) => {
      if (m.name !== name) return false
      if (timeWindow && m.timestamp.getTime() < cutoff) return false
      return true
    }).length
  }

  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {}

    // Group metrics by name
    const grouped = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetric[]>)

    // Calculate summary for each metric
    Object.entries(grouped).forEach(([name, metrics]) => {
      const values = metrics.map((m) => m.value)
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: values[values.length - 1],
      }
    })

    return summary
  }

  clear() {
    this.metrics = []
  }
}

export const performanceMetrics = new PerformanceMetrics()

// Web Vitals reporting
export function reportWebVitals(metric: WebVitalsMetric) {
  performanceMetrics.recordWebVitals(metric)
  
  // Send to external analytics if needed
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }
}

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const startTimer = (name: string) => {
    const start = performance.now()
    
    return {
      end: (tags?: Record<string, string>) => {
        const duration = performance.now() - start
        performanceMetrics.recordMetric(name, duration, 'ms', tags)
        return duration
      },
    }
  }

  const measureAsync = async <T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> => {
    const timer = startTimer(name)
    try {
      const result = await fn()
      timer.end(tags)
      return result
    } catch (error) {
      timer.end({ ...tags, error: 'true' })
      throw error
    }
  }

  const measureSync = <T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T => {
    const timer = startTimer(name)
    try {
      const result = fn()
      timer.end(tags)
      return result
    } catch (error) {
      timer.end({ ...tags, error: 'true' })
      throw error
    }
  }

  return {
    startTimer,
    measureAsync,
    measureSync,
    recordMetric: performanceMetrics.recordMetric.bind(performanceMetrics),
  }
}
