import { NextRequest, NextResponse } from 'next/server'
import logger from './logger'

export interface RequestLogData {
  method: string
  url: string
  userAgent?: string
  ip?: string
  userId?: string
  teamId?: string
  duration?: number
  statusCode?: number
  error?: string
  requestSize?: number
  responseSize?: number
}

export class RequestLogger {
  private startTime: number

  constructor(private request: NextRequest) {
    this.startTime = Date.now()
  }

  logRequest(data: Partial<RequestLogData> = {}) {
    const duration = Date.now() - this.startTime
    const logData: RequestLogData = {
      method: this.request.method,
      url: this.request.url,
      userAgent: this.request.headers.get('user-agent') || undefined,
      ip: this.getClientIP(),
      duration,
      ...data,
    }

    logger.info('HTTP Request', logData)
    return logData
  }

  logResponse(response: NextResponse, data: Partial<RequestLogData> = {}) {
    const duration = Date.now() - this.startTime
    const logData: RequestLogData = {
      method: this.request.method,
      url: this.request.url,
      userAgent: this.request.headers.get('user-agent') || undefined,
      ip: this.getClientIP(),
      duration,
      statusCode: response.status,
      ...data,
    }

    const level = response.status >= 400 ? 'error' : 'info'
    logger[level]('HTTP Response', logData)
    return logData
  }

  logError(error: Error, data: Partial<RequestLogData> = {}) {
    const duration = Date.now() - this.startTime
    const logData: RequestLogData = {
      method: this.request.method,
      url: this.request.url,
      userAgent: this.request.headers.get('user-agent') || undefined,
      ip: this.getClientIP(),
      duration,
      error: error.message,
      ...data,
    }

    logger.error('HTTP Error', {
      ...logData,
      stack: error.stack,
    })
    return logData
  }

  private getClientIP(): string | undefined {
    const forwarded = this.request.headers.get('x-forwarded-for')
    const realIP = this.request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return undefined
  }
}

export function createRequestLogger(request: NextRequest) {
  return new RequestLogger(request)
}
