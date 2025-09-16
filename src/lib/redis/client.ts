import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL

    if (!redisUrl) {
      throw new Error(
        'Redis URL not configured. Please set REDIS_URL or UPSTASH_REDIS_REST_URL environment variable.'
      )
    }

    // For Upstash Redis (recommended for Vercel)
    if (redisUrl.includes('upstash')) {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
      })
    } else {
      // For other Redis providers
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
      })
    }

    redis.on('error', (error) => {
      console.error('Redis connection error:', error)
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redis
}

export function closeRedisConnection(): void {
  if (redis) {
    redis.disconnect()
    redis = null
  }
}
