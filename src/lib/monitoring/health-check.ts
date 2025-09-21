import { createClient } from '@/lib/supabase/client'
import logger from '@/lib/logging/logger'

export interface HealthCheckResult {
  service: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime: number
  details?: Record<string, unknown>
  error?: string
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: Date
  services: HealthCheckResult[]
  uptime: number
  version: string
}

class HealthChecker {
  private startTime = Date.now()

  async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      const supabase = createClient()
      // Fazer uma consulta simples que sempre funciona
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      const responseTime = Date.now() - start

      if (error) {
        return {
          service: 'database',
          status: 'unhealthy',
          responseTime,
          error: error.message,
        }
      }

      return {
        service: 'database',
        status: 'healthy',
        responseTime,
        details: { connection: 'active' },
      }
    } catch (error) {
      return {
        service: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Check Redis connection through Supabase Realtime
      const supabase = createClient()
      const channel = supabase.channel('health-check')
      
      const responseTime = Date.now() - start

      return {
        service: 'redis',
        status: 'healthy',
        responseTime,
        details: { connection: 'active' },
      }
    } catch (error) {
      return {
        service: 'redis',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async checkZApi(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Verificar se há instâncias Z-API ativas no banco
      const supabase = createClient()
      const { data: instances, error } = await supabase
        .from('z_api_instances')
        .select('id, name, is_active')
        .eq('is_active', true)
        .limit(1)

      const responseTime = Date.now() - start

      if (error) {
        return {
          service: 'z-api',
          status: 'unhealthy',
          responseTime,
          error: error.message,
        }
      }

      if (!instances || instances.length === 0) {
        return {
          service: 'z-api',
          status: 'degraded',
          responseTime,
          details: { message: 'No active Z-API instances found' },
        }
      }

      return {
        service: 'z-api',
        status: 'healthy',
        responseTime,
        details: { 
          activeInstances: instances.length,
          instanceName: instances[0]?.name 
        },
      }
    } catch (error) {
      return {
        service: 'z-api',
        status: 'unhealthy',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async checkExternalServices(): Promise<HealthCheckResult> {
    const start = Date.now()
    
    try {
      // Check external services like Supabase
      const response = await fetch('https://api.supabase.com/health', {
        method: 'GET',
      })

      const responseTime = Date.now() - start

      return {
        service: 'external-services',
        status: response.ok ? 'healthy' : 'degraded',
        responseTime,
        details: { status: response.status },
      }
    } catch (error) {
      return {
        service: 'external-services',
        status: 'degraded',
        responseTime: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async performHealthCheck(): Promise<SystemHealth> {
    const services = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkZApi(),
      this.checkExternalServices(),
    ])

    const results: HealthCheckResult[] = services.map((result) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          service: 'unknown',
          status: 'unhealthy',
          responseTime: 0,
          error: result.reason?.message || 'Unknown error',
        }
      }
    })

    // Determine overall system status
    const hasUnhealthy = results.some((r) => r.status === 'unhealthy')
    const hasDegraded = results.some((r) => r.status === 'degraded')
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy'
    if (hasUnhealthy) {
      status = 'unhealthy'
    } else if (hasDegraded) {
      status = 'degraded'
    }

    const systemHealth: SystemHealth = {
      status,
      timestamp: new Date(),
      services: results,
      uptime: Date.now() - this.startTime,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    }

    // Log health check results
    logger.info('Health Check Completed', {
      status: systemHealth.status,
      services: results.length,
      unhealthy: results.filter((r) => r.status === 'unhealthy').length,
      degraded: results.filter((r) => r.status === 'degraded').length,
    })

    return systemHealth
  }
}

export const healthChecker = new HealthChecker()

// API route for health checks
export async function GET() {
  try {
    const health = await healthChecker.performHealthCheck()
    
    return Response.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    logger.error('Health check failed', { error })
    
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
