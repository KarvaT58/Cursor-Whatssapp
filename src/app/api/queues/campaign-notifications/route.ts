import { NextRequest, NextResponse } from 'next/server'
import { getCampaignNotificationsQueue } from '@/lib/queues/queue-manager'
import { CampaignNotificationJob } from '@/lib/queues/queue-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['campaignId', 'status']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const jobData: CampaignNotificationJob = {
      campaignId: body.campaignId,
      status: body.status,
      message: body.message,
    }

    const queue = getCampaignNotificationsQueue()
    const job = await queue.add('campaign-notification', jobData, {
      priority: body.priority || 0,
      delay: body.delay || 0,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Campaign notification added to queue',
    })
  } catch (error) {
    console.error('Error adding campaign notification to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add campaign notification to queue' },
      { status: 500 }
    )
  }
}
