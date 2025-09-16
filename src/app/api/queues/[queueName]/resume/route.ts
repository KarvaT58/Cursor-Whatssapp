import { NextRequest, NextResponse } from 'next/server'
import {
  getCampaignMessagesQueue,
  getCampaignNotificationsQueue,
  getMessageRetryQueue,
} from '@/lib/queues/queue-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueName: string }> }
) {
  try {
    const { queueName } = await params

    let queue
    switch (queueName) {
      case 'campaign-messages':
        queue = getCampaignMessagesQueue()
        break
      case 'campaign-notifications':
        queue = getCampaignNotificationsQueue()
        break
      case 'message-retry':
        queue = getMessageRetryQueue()
        break
      default:
        return NextResponse.json(
          { error: 'Invalid queue name' },
          { status: 400 }
        )
    }

    await queue.resume()

    return NextResponse.json({
      success: true,
      message: `Queue ${queueName} resumed successfully`,
    })
  } catch (error) {
    console.error('Error resuming queue:', error)
    return NextResponse.json(
      { error: 'Failed to resume queue' },
      { status: 500 }
    )
  }
}
