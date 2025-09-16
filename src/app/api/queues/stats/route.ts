import { NextResponse } from 'next/server'
import {
  getCampaignMessagesQueue,
  getCampaignNotificationsQueue,
  getMessageRetryQueue,
} from '@/lib/queues/queue-manager'

export async function GET() {
  try {
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
    return NextResponse.json(
      { error: 'Failed to fetch queue stats' },
      { status: 500 }
    )
  }
}
