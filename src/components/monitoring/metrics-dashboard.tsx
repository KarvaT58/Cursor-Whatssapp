'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RefreshCw, TrendingUp, TrendingDown, Activity, Users, MessageSquare, Target } from 'lucide-react'

interface MetricsData {
  performance: {
    summary: Record<string, unknown>
    webVitals: {
      cls: number
      fid: number
      fcp: number
      lcp: number
      ttfb: number
    }
    api: {
      averageResponseTime: number
      totalCalls: number
    }
    database: {
      averageQueryTime: number
      totalQueries: number
    }
  }
  business: {
    dashboard: {
      messagesSent24h: number
      campaignsStarted24h: number
      messagesSent7d: number
      campaignsCreated7d: number
      totalMessages: number
      totalCampaigns: number
      totalContacts: number
    }
    campaigns: Record<string, Record<string, number>>
    messages: Record<string, Record<string, number>>
    users: Record<string, Record<string, number>>
    contacts: Record<string, Record<string, number>>
  }
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('24h')

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/metrics?type=all')
      if (!response.ok) {
        throw new Error('Failed to fetch metrics data')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms.toFixed(0)}ms`
  }

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading metrics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Metrics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Metrics Dashboard</h2>
          <p className="text-gray-600">Performance and business metrics overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent (24h)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics?.business.dashboard.messagesSent24h || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns Started (24h)</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics?.business.dashboard.campaignsStarted24h || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics?.business.dashboard.totalMessages || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(metrics?.business.dashboard.totalContacts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Web Vitals</CardTitle>
            <CardDescription>Core Web Vitals performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                <Badge variant={(metrics?.performance?.webVitals?.lcp || 0) < 2500 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.webVitals?.lcp || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FID (First Input Delay)</span>
                <Badge variant={(metrics?.performance?.webVitals?.fid || 0) < 100 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.webVitals?.fid || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                <Badge variant={(metrics?.performance?.webVitals?.cls || 0) < 0.1 ? 'default' : 'destructive'}>
                  {(metrics?.performance?.webVitals?.cls || 0).toFixed(3)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">FCP (First Contentful Paint)</span>
                <Badge variant={(metrics?.performance?.webVitals?.fcp || 0) < 1800 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.webVitals?.fcp || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">TTFB (Time to First Byte)</span>
                <Badge variant={(metrics?.performance?.webVitals?.ttfb || 0) < 600 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.webVitals?.ttfb || 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Performance</CardTitle>
            <CardDescription>Backend API response times and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Response Time</span>
                <Badge variant={(metrics?.performance?.api?.averageResponseTime || 0) < 200 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.api?.averageResponseTime || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total API Calls</span>
                <Badge variant="outline">
                  {formatNumber(metrics?.performance?.api?.totalCalls || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Query Time</span>
                <Badge variant={(metrics?.performance?.database?.averageQueryTime || 0) < 50 ? 'default' : 'destructive'}>
                  {formatTime(metrics?.performance?.database?.averageQueryTime || 0)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Queries</span>
                <Badge variant="outline">
                  {formatNumber(metrics?.performance?.database?.totalQueries || 0)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
