import { NextRequest, NextResponse } from 'next/server'
import { performanceMetrics } from '@/lib/metrics/performance-metrics'
import { businessMetrics } from '@/lib/metrics/business-metrics'
import { createRequestLogger } from '@/lib/logging/request-logger'
import logger from '@/lib/logging/logger'

export async function GET(request: NextRequest) {
  const requestLogger = createRequestLogger(request)
  
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'all'
    const teamId = url.searchParams.get('teamId')
    const userId = url.searchParams.get('userId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const metrics: Record<string, unknown> = {}

    if (type === 'performance' || type === 'all') {
      metrics.performance = {
        summary: performanceMetrics.getSummary(),
        webVitals: {
          cls: performanceMetrics.getAverageMetric('web-vitals.cls'),
          fid: performanceMetrics.getAverageMetric('web-vitals.fid'),
          fcp: performanceMetrics.getAverageMetric('web-vitals.fcp'),
          lcp: performanceMetrics.getAverageMetric('web-vitals.lcp'),
          ttfb: performanceMetrics.getAverageMetric('web-vitals.ttfb'),
        },
        api: {
          averageResponseTime: performanceMetrics.getAverageMetric('api.call.duration'),
          totalCalls: performanceMetrics.getMetricCount('api.call.count'),
        },
        database: {
          averageQueryTime: performanceMetrics.getAverageMetric('database.query.duration'),
          totalQueries: performanceMetrics.getMetricCount('database.query.count'),
        },
      }
    }

    if (type === 'business' || type === 'all') {
      const filters: Record<string, unknown> = {}
      if (teamId) filters.teamId = teamId
      if (userId) filters.userId = userId
      if (startDate) filters.startDate = new Date(startDate)
      if (endDate) filters.endDate = new Date(endDate)

      metrics.business = {
        dashboard: businessMetrics.getDashboardData(teamId, userId),
        campaigns: {
          created: businessMetrics.getAggregatedMetrics('campaign.created', 'day', filters.startDate, filters.endDate),
          started: businessMetrics.getAggregatedMetrics('campaign.started', 'day', filters.startDate, filters.endDate),
          completed: businessMetrics.getAggregatedMetrics('campaign.completed', 'day', filters.startDate, filters.endDate),
        },
        messages: {
          sent: businessMetrics.getAggregatedMetrics('message.sent', 'day', filters.startDate, filters.endDate),
          delivered: businessMetrics.getAggregatedMetrics('message.delivered', 'day', filters.startDate, filters.endDate),
          failed: businessMetrics.getAggregatedMetrics('message.failed', 'day', filters.startDate, filters.endDate),
        },
        users: {
          registrations: businessMetrics.getAggregatedMetrics('user.registration', 'day', filters.startDate, filters.endDate),
          logins: businessMetrics.getAggregatedMetrics('user.login', 'day', filters.startDate, filters.endDate),
        },
        contacts: {
          created: businessMetrics.getAggregatedMetrics('contact.created', 'day', filters.startDate, filters.endDate),
          imported: businessMetrics.getAggregatedMetrics('contact.imported', 'day', filters.startDate, filters.endDate),
        },
      }
    }

    const response = NextResponse.json(metrics)
    requestLogger.logResponse(response, { 
      teamId, 
      userId, 
      type 
    })

    return response
  } catch (error) {
    logger.error('Failed to get metrics', { error })
    const response = NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    )
    requestLogger.logError(error as Error)
    return response
  }
}
