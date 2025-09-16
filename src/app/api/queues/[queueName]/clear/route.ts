import { NextRequest, NextResponse } from 'next/server'
import {
  getCampaignMessagesQueue,
  getCampaignNotificationsQueue,
  getMessageRetryQueue,
} from '@/lib/queues/queue-manager'

export async function DELETE(
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

    await queue.obliterate({ force: true })

    return NextResponse.json({
      success: true,
      message: `Queue ${queueName} cleared successfully`,
    })
  } catch (error) {
    console.error('Error clearing queue:', error)
    return NextResponse.json(
      { error: 'Failed to clear queue' },
      { status: 500 }
    )
  }
}
