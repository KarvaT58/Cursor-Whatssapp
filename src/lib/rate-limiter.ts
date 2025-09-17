import { getRedisClient } from '@/lib/redis/client'
import type Redis from 'ioredis'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (identifier: string) => string // Custom key generator
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

export class RateLimiter {
  private redis: Redis | null = null
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  private getRedis(): Redis | null {
    if (!this.redis) {
      try {
        this.redis = getRedisClient()
      } catch (error) {
        console.warn('Redis not available, rate limiting disabled:', error)
        return null
      }
    }
    return this.redis
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const redis = this.getRedis()

    // If Redis is not available, allow all requests
    if (!redis) {
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: Date.now() + this.config.windowMs,
      }
    }

    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.pipeline()

      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, windowStart)

      // Count current requests in window
      pipeline.zcard(key)

      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`)

      // Set expiration
      pipeline.expire(key, Math.ceil(this.config.windowMs / 1000))

      const results = await pipeline.exec()

      if (!results) {
        throw new Error('Redis pipeline execution failed')
      }

      const currentCount = results[1][1] as number
      const allowed = currentCount < this.config.maxRequests
      const remaining = Math.max(0, this.config.maxRequests - currentCount - 1)
      const resetTime = now + this.config.windowMs

      if (!allowed) {
        // Get the oldest request to calculate retry after
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES')
        const retryAfter =
          oldestRequest.length > 0
            ? Math.ceil(
                (parseInt(oldestRequest[1]) + this.config.windowMs - now) / 1000
              )
            : Math.ceil(this.config.windowMs / 1000)

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        }
      }

      return {
        allowed: true,
        remaining,
        resetTime,
      }
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      }
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    const redis = this.getRedis()
    if (!redis) return // No-op if Redis not available

    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`

    await redis.del(key)
  }

  async getRemaining(identifier: string): Promise<number> {
    const redis = this.getRedis()
    if (!redis) return this.config.maxRequests // Return max if Redis not available

    const key = this.config.keyGenerator
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`

    const now = Date.now()
    const windowStart = now - this.config.windowMs

    try {
      // Remove expired entries and count remaining
      await redis.zremrangebyscore(key, 0, windowStart)
      const count = await redis.zcard(key)

      return Math.max(0, this.config.maxRequests - count)
    } catch (error) {
      console.error('Error getting remaining limit:', error)
      return this.config.maxRequests
    }
  }
}

// Pre-configured rate limiters for different use cases
export const whatsappRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 messages per minute per instance
  keyGenerator: (instanceId: string) => `whatsapp_rate_limit:${instanceId}`,
})

export const campaignRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 campaign messages per minute per user
  keyGenerator: (userId: string) => `campaign_rate_limit:${userId}`,
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 1000, // 1000 API requests per minute per user
  keyGenerator: (userId: string) => `api_rate_limit:${userId}`,
})

// WhatsApp Business API specific rate limits
export const whatsappBusinessRateLimiter = new RateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 1000, // 1000 messages per day per instance
  keyGenerator: (instanceId: string) => `whatsapp_business_daily:${instanceId}`,
})

// Rate limiter for message retries
export const retryRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 retries per 5 minutes per message
  keyGenerator: (messageId: string) => `retry_rate_limit:${messageId}`,
})
