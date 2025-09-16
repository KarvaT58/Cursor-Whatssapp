import { NextRequest, NextResponse } from 'next/server'
import { getMessageRetryQueue } from '@/lib/queues/queue-manager'
import { MessageRetryJob } from '@/lib/queues/queue-manager'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = [
      'messageId',
      'phone',
      'message',
      'instanceId',
      'instanceToken',
      'clientToken',
      'retryCount',
    ]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const jobData: MessageRetryJob = {
      messageId: body.messageId,
      phone: body.phone,
      message: body.message,
      instanceId: body.instanceId,
      instanceToken: body.instanceToken,
      clientToken: body.clientToken,
      retryCount: body.retryCount,
    }

    const queue = getMessageRetryQueue()
    const job = await queue.add('retry-message', jobData, {
      priority: body.priority || 0,
      delay: body.delay || 0,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Message retry added to queue',
    })
  } catch (error) {
    console.error('Error adding message retry to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add message retry to queue' },
      { status: 500 }
    )
  }
}
