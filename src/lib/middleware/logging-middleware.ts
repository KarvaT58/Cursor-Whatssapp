import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/logging/request-logger'
import { performanceMetrics } from '@/lib/metrics/performance-metrics'
import logger from '@/lib/logging/logger'

export function withLogging(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const requestLogger = createRequestLogger(request)
    const startTime = Date.now()

    try {
      // Log the incoming request
      requestLogger.logRequest()

      // Execute the handler
      const response = await handler(request)

      // Calculate performance metrics
      const duration = Date.now() - startTime
      const url = new URL(request.url)
      
      performanceMetrics.recordApiCall(
        url.pathname,
        duration,
        response.status,
        request.method
      )

      // Log the response
      requestLogger.logResponse(response)

      return response
    } catch (error) {
      // Log the error
      requestLogger.logError(error as Error)
      
      // Record error metric
      performanceMetrics.recordError(
        error instanceof Error ? error.message : 'Unknown error'
      )

      // Re-throw the error
      throw error
    }
  }
}

export function withPerformanceMonitoring<T extends unknown[], R>(
  name: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now()
    
    try {
      const result = await handler(...args)
      const duration = Date.now() - startTime
      
      performanceMetrics.recordMetric(name, duration, 'ms')
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      performanceMetrics.recordMetric(name, duration, 'ms', { error: 'true' })
      performanceMetrics.recordError(
        error instanceof Error ? error.message : 'Unknown error'
      )
      
      throw error
    }
  }
}

export function withAuditLogging<T extends unknown[], R>(
  action: string,
  resource: string,
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      const result = await handler(...args)
      
      // Log successful action
      logger.info('Audit Log', {
        action,
        resource,
        status: 'success',
        timestamp: new Date(),
      })
      
      return result
    } catch (error) {
      // Log failed action
      logger.error('Audit Log', {
        action,
        resource,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      })
      
      throw error
    }
  }
}
