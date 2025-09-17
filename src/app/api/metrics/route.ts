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

      const startDateObj = startDate ? new Date(startDate) : undefined
      const endDateObj = endDate ? new Date(endDate) : undefined

      metrics.business = {
        dashboard: businessMetrics.getDashboardData(teamId || undefined, userId || undefined),
        campaigns: {
          created: businessMetrics.getAggregatedMetrics('campaign.created', 'day', startDateObj, endDateObj),
          started: businessMetrics.getAggregatedMetrics('campaign.started', 'day', startDateObj, endDateObj),
          completed: businessMetrics.getAggregatedMetrics('campaign.completed', 'day', startDateObj, endDateObj),
        },
        messages: {
          sent: businessMetrics.getAggregatedMetrics('message.sent', 'day', startDateObj, endDateObj),
          delivered: businessMetrics.getAggregatedMetrics('message.delivered', 'day', startDateObj, endDateObj),
          failed: businessMetrics.getAggregatedMetrics('message.failed', 'day', startDateObj, endDateObj),
        },
        users: {
          registrations: businessMetrics.getAggregatedMetrics('user.registration', 'day', startDateObj, endDateObj),
          logins: businessMetrics.getAggregatedMetrics('user.login', 'day', startDateObj, endDateObj),
        },
        contacts: {
          created: businessMetrics.getAggregatedMetrics('contact.created', 'day', startDateObj, endDateObj),
          imported: businessMetrics.getAggregatedMetrics('contact.imported', 'day', startDateObj, endDateObj),
        },
      }
    }

    const response = NextResponse.json(metrics)
    requestLogger.logResponse(response, {
      teamId: teamId || undefined,
      userId: userId || undefined
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
