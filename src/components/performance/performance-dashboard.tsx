'use client'

import { useState, useEffect } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  RefreshCw,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PerformanceMonitor } from './performance-monitor'
import { usePerformanceOptimization } from '@/hooks/use-performance-optimization'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const {
    metrics,
    recommendations,
    isOptimized,
    score,
    updateMetrics,
    cacheStats,
  } = usePerformanceOptimization({
    enableMemoryMonitoring: true,
    enableNetworkMonitoring: true,
    enableCacheOptimization: true,
    enableBundleOptimization: true,
    enableQueryOptimization: true,
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default' as const
    if (score >= 60) return 'secondary' as const
    return 'destructive' as const
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
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and optimize your application performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={updateMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Score
              </CardTitle>
              <CardDescription>
                Overall application performance rating
              </CardDescription>
            </div>
            <Badge
              variant={getScoreBadgeVariant(score)}
              className="text-lg px-3 py-1"
            >
              {score.toFixed(0)}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={score} className="h-3" />
            <div className="flex items-center gap-2">
              {isOptimized ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Performance is optimized
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">
                    Performance needs attention
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Memory Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.memoryUsage.toFixed(1)}%
                </div>
                <Progress value={metrics.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>

            {/* Network Latency */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Network Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.networkLatency)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.networkLatency < 100
                    ? 'Excellent'
                    : metrics.networkLatency < 300
                      ? 'Good'
                      : metrics.networkLatency < 500
                        ? 'Fair'
                        : 'Poor'}
                </div>
              </CardContent>
            </Card>

            {/* Cache Hit Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Cache Hit Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics.cacheHitRate * 100).toFixed(1)}%
                </div>
                <Progress value={metrics.cacheHitRate * 100} className="mt-2" />
              </CardContent>
            </Card>

            {/* Render Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Render Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatTime(metrics.renderTime)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.renderTime < 50
                    ? 'Fast'
                    : metrics.renderTime < 100
                      ? 'Good'
                      : metrics.renderTime < 200
                        ? 'Fair'
                        : 'Slow'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Monitor */}
          <PerformanceMonitor showDetails={true} />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detailed Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
                <CardDescription>
                  Comprehensive performance measurements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">
                      {metrics.memoryUsage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.memoryUsage} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Network Latency</span>
                    <span className="text-sm font-medium">
                      {formatTime(metrics.networkLatency)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (metrics.networkLatency / 1000) * 100)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-medium">
                      {(metrics.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.cacheHitRate * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Render Time</span>
                    <span className="text-sm font-medium">
                      {formatTime(metrics.renderTime)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (metrics.renderTime / 200) * 100)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Query Time</span>
                    <span className="text-sm font-medium">
                      {formatTime(metrics.queryTime)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, (metrics.queryTime / 2000) * 100)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Historical performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>Performance trends will be displayed here</p>
                  <p className="text-xs">
                    Historical data collection coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>
                Optimize your application based on these suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-green-600">
                    No recommendations at this time
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your application is performing well!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{recommendation}</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cache Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>
                  Current cache performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Hit Rate</span>
                    <span className="text-sm font-medium">
                      {(cacheStats.hitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={cacheStats.hitRate * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Size</span>
                    <span className="text-sm font-medium">
                      {formatBytes(cacheStats.size)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Entries</span>
                    <span className="text-sm font-medium">
                      {cacheStats.entries}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Hits</span>
                    <span className="text-sm font-medium">
                      {cacheStats.hits}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Misses</span>
                    <span className="text-sm font-medium">
                      {cacheStats.misses}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cache Management */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
                <CardDescription>Manage your application cache</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full">
                    Optimize Cache
                  </Button>
                  <Button variant="outline" className="w-full">
                    Export Cache Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
