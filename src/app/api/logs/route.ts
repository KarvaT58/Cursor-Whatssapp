import { NextRequest, NextResponse } from 'next/server'
import { createRequestLogger } from '@/lib/logging/request-logger'
import logger from '@/lib/logging/logger'
import { auditLog } from '@/lib/logging/audit-logger'

export async function GET(request: NextRequest) {
  const requestLogger = createRequestLogger(request)
  
  try {
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'audit'
    const userId = url.searchParams.get('userId')
    const teamId = url.searchParams.get('teamId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    const limit = parseInt(url.searchParams.get('limit') || '100')

    // In a real implementation, you would query your log storage
    // For now, we'll return a mock response
    const logs = {
      audit: [
        {
          timestamp: new Date().toISOString(),
          userId: userId || 'user-123',
          teamId: teamId || 'team-456',
          action: 'login',
          resource: 'user',
          details: { ip: '192.168.1.1' },
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: userId || 'user-123',
          teamId: teamId || 'team-456',
          action: 'create',
          resource: 'campaign',
          resourceId: 'campaign-789',
          details: { name: 'Test Campaign' },
        },
      ],
      error: [
        {
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Database connection failed',
          stack: 'Error: Connection timeout\n    at Database.connect()',
          userId: userId || 'user-123',
          teamId: teamId || 'team-456',
        },
      ],
      performance: [
        {
          timestamp: new Date().toISOString(),
          name: 'api.call.duration',
          value: 150,
          unit: 'ms',
          tags: { endpoint: '/api/campaigns', method: 'GET' },
        },
      ],
    }

    const response = NextResponse.json({
      logs: logs[type as keyof typeof logs] || [],
      total: logs[type as keyof typeof logs]?.length || 0,
      filters: {
        type,
        userId,
        teamId,
        startDate,
        endDate,
        limit,
      },
    })

    requestLogger.logResponse(response, { 
      teamId: teamId || undefined, 
      userId: userId || undefined
    })

    return response
  } catch (error) {
    logger.error('Failed to get logs', { error })
    const response = NextResponse.json(
      { error: 'Failed to get logs' },
      { status: 500 }
    )
    requestLogger.logError(error as Error)
    return response
  }
}

export async function POST(request: NextRequest) {
  const requestLogger = createRequestLogger(request)
  
  try {
    const body = await request.json()
    const { type, userId, teamId, action, resource, details } = body

    // Log the audit event
    if (type === 'audit') {
      auditLog.user.login(userId, details)
    }

    const response = NextResponse.json({ success: true })
    requestLogger.logResponse(response, { 
      teamId, 
      userId
    })

    return response
  } catch (error) {
    logger.error('Failed to create log entry', { error })
    const response = NextResponse.json(
      { error: 'Failed to create log entry' },
      { status: 500 }
    )
    requestLogger.logError(error as Error)
    return response
  }
}
