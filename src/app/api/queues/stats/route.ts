import { NextResponse } from 'next/server'
import {
  getCampaignMessagesQueue,
  getCampaignNotificationsQueue,
  getMessageRetryQueue,
} from '@/lib/queues/queue-manager'

// Mock stats for when Redis is not available
const getMockStats = () => ({
  waiting: 0,
  active: 0,
  completed: 0,
  failed: 0,
  delayed: 0,
  paused: 0,
})

export async function GET() {
  try {
    // Check if Redis is configured
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL

    if (!redisUrl || redisUrl === 'your_redis_url') {
      console.warn('Redis not configured, returning mock queue stats')
      return NextResponse.json({
        campaignMessages: getMockStats(),
        campaignNotifications: getMockStats(),
        messageRetry: getMockStats(),
        warning: 'Redis not configured - showing mock data',
      })
    }

    const campaignMessagesQueue = getCampaignMessagesQueue()
    const campaignNotificationsQueue = getCampaignNotificationsQueue()
    const messageRetryQueue = getMessageRetryQueue()

    const [
      campaignMessagesStats,
      campaignNotificationsStats,
      messageRetryStats,
    ] = await Promise.all([
      campaignMessagesQueue.getJobCounts(),
      campaignNotificationsQueue.getJobCounts(),
      messageRetryQueue.getJobCounts(),
    ])

    return NextResponse.json({
      campaignMessages: campaignMessagesStats,
      campaignNotifications: campaignNotificationsStats,
      messageRetry: messageRetryStats,
    })
  } catch (error) {
    console.error('Error fetching queue stats:', error)

    // Return mock data instead of failing completely
    return NextResponse.json({
      campaignMessages: getMockStats(),
      campaignNotifications: getMockStats(),
      messageRetry: getMockStats(),
      error: 'Redis connection failed - showing mock data',
    })
  }
}
