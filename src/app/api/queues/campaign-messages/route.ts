import { NextRequest, NextResponse } from 'next/server'
import { getCampaignMessagesQueue } from '@/lib/queues/queue-manager'
import { CampaignMessageJob } from '@/lib/queues/queue-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'campaignId',
      'contactId',
      'phone',
      'message',
      'instanceId',
      'instanceToken',
      'clientToken',
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const jobData: CampaignMessageJob = {
      campaignId: body.campaignId,
      contactId: body.contactId,
      phone: body.phone,
      message: body.message,
      instanceId: body.instanceId,
      instanceToken: body.instanceToken,
      clientToken: body.clientToken,
      retryCount: body.retryCount || 0,
    }

    const queue = getCampaignMessagesQueue()
    const job = await queue.add('send-campaign-message', jobData, {
      priority: body.priority || 0,
      delay: body.delay || 0,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Campaign message added to queue',
    })
  } catch (error) {
    console.error('Error adding campaign message to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add campaign message to queue' },
      { status: 500 }
    )
  }
}
