'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Activity,
  Zap,
  Database,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceMetrics {
  // Memory metrics
  memory: {
    used: number
    total: number
    percentage: number
  }

  // Network metrics
  network: {
    latency: number
    throughput: number
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor'
  }

  // Cache metrics
  cache: {
    hitRate: number
    size: number
    entries: number
  }

  // Realtime metrics
  realtime: {
    isConnected: boolean
    messageCount: number
    errorCount: number
    lastMessage: Date | null
  }

  // Performance metrics
  performance: {
    renderTime: number
    queryTime: number
    bundleSize: number
  }
}

interface PerformanceMonitorProps {
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceMonitor({
  className,
  showDetails = false,
  autoRefresh = true,
  refreshInterval = 5000,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { used: 0, total: 0, percentage: 0 },
    network: { latency: 0, throughput: 0, connectionQuality: 'good' },
    cache: { hitRate: 0, size: 0, entries: 0 },
    realtime: {
      isConnected: false,
      messageCount: 0,
      errorCount: 0,
      lastMessage: null,
    },
    performance: { renderTime: 0, queryTime: 0, bundleSize: 0 },
  })

  const [isExpanded, setIsExpanded] = useState(showDetails)

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (
        performance as {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number }
        }
      ).memory
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      }
    }
    return { used: 0, total: 0, percentage: 0 }
  }, [])

  // Get network latency
  const getNetworkLatency = useCallback(async () => {
    const start = performance.now()
    try {
      await fetch('/api/health', { method: 'HEAD' })
      return performance.now() - start
    } catch {
      return 0
    }
  }, [])

  // Get cache metrics (placeholder - would integrate with actual cache)
  const getCacheMetrics = useCallback(() => {
    // This would integrate with your actual cache implementation
    return {
      hitRate: 0.85,
      size: 1024 * 1024, // 1MB
      entries: 150,
    }
  }, [])

  // Get realtime metrics (placeholder - would integrate with actual realtime)
  const getRealtimeMetrics = useCallback(() => {
    // This would integrate with your actual realtime implementation
    return {
      isConnected: true,
      messageCount: 42,
      errorCount: 0,
      lastMessage: new Date(),
    }
  }, [])

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming
    const renderTime = navigation
      ? navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart
      : 0

    return {
      renderTime,
      queryTime: 0, // Would integrate with actual query timing
      bundleSize: 0, // Would integrate with actual bundle size
    }
  }, [])

  // Update metrics
  const updateMetrics = useCallback(async () => {
    const [latency] = await Promise.all([getNetworkLatency()])

    const memory = getMemoryUsage()
    const cache = getCacheMetrics()
    const realtime = getRealtimeMetrics()
    const performance = getPerformanceMetrics()

    // Determine connection quality based on latency
    let connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good'
    if (latency < 100) connectionQuality = 'excellent'
    else if (latency < 300) connectionQuality = 'good'
    else if (latency < 500) connectionQuality = 'fair'
    else connectionQuality = 'poor'

    setMetrics({
      memory,
      network: { latency, throughput: 0, connectionQuality },
      cache,
      realtime,
      performance,
    })
  }, [
    getMemoryUsage,
    getNetworkLatency,
    getCacheMetrics,
    getRealtimeMetrics,
    getPerformanceMetrics,
  ])

  // Auto-refresh metrics
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(updateMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, updateMetrics])

  // Initial metrics update
  useEffect(() => {
    updateMetrics()
  }, [updateMetrics])

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500'
      case 'good':
        return 'text-blue-500'
      case 'fair':
        return 'text-yellow-500'
      case 'poor':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return <CheckCircle className="h-4 w-4" />
      case 'good':
        return <CheckCircle className="h-4 w-4" />
      case 'fair':
        return <AlertTriangle className="h-4 w-4" />
      case 'poor':
        return <XCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Monitor
            </CardTitle>
            <CardDescription>
              Real-time system performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button variant="outline" size="sm" onClick={updateMetrics}>
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Memory Usage</span>
            </div>
            <Badge variant="outline">
              {formatBytes(metrics.memory.used)} /{' '}
              {formatBytes(metrics.memory.total)}
            </Badge>
          </div>
          <Progress value={metrics.memory.percentage} className="h-2" />
        </div>

        {/* Network Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatTime(metrics.network.latency)}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1',
                  getConnectionQualityColor(metrics.network.connectionQuality)
                )}
              >
                {getConnectionQualityIcon(metrics.network.connectionQuality)}
                <span className="text-xs capitalize">
                  {metrics.network.connectionQuality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Realtime Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Realtime</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  metrics.realtime.isConnected ? 'default' : 'destructive'
                }
              >
                {metrics.realtime.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {metrics.realtime.messageCount} msgs
              </span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Cache Hit Rate</span>
            </div>
            <Badge variant="outline">
              {(metrics.cache.hitRate * 100).toFixed(1)}%
            </Badge>
          </div>
          <Progress value={metrics.cache.hitRate * 100} className="h-2" />
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Detailed Metrics</h4>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">
                      Render Time
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatTime(metrics.performance.renderTime)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">
                      Cache Size
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatBytes(metrics.cache.size)}
                  </span>
                </div>
              </div>

              {/* Realtime Details */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">
                  Realtime Details
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Messages:</span>
                    <span className="ml-2 font-medium">
                      {metrics.realtime.messageCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Errors:</span>
                    <span className="ml-2 font-medium">
                      {metrics.realtime.errorCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
