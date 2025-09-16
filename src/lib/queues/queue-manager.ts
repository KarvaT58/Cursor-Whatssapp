import { Queue, Job, QueueEvents } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import { ZApiClient } from '@/lib/z-api/client'
import { createClient } from '@/lib/supabase/server'

// Queue names
export const QUEUE_NAMES = {
  CAMPAIGN_MESSAGES: 'campaign-messages',
  CAMPAIGN_NOTIFICATIONS: 'campaign-notifications',
  MESSAGE_RETRY: 'message-retry',
} as const

// Job types
export interface CampaignMessageJob {
  campaignId: string
  contactId: string
  phone: string
  message: string
  instanceId: string
  instanceToken: string
  clientToken: string
  retryCount?: number
  user_id?: string
}

export interface CampaignNotificationJob {
  campaignId: string
  status: 'started' | 'completed' | 'failed'
  message?: string
}

export interface MessageRetryJob {
  messageId: string
  phone: string
  message: string
  instanceId: string
  instanceToken: string
  clientToken: string
  retryCount: number
}

// Queue instances
let campaignMessagesQueue: Queue<CampaignMessageJob> | null = null
let campaignNotificationsQueue: Queue<CampaignNotificationJob> | null = null
let messageRetryQueue: Queue<MessageRetryJob> | null = null

// Queue events
let campaignMessagesEvents: QueueEvents | null = null
let campaignNotificationsEvents: QueueEvents | null = null
let messageRetryEvents: QueueEvents | null = null

export function getCampaignMessagesQueue(): Queue<CampaignMessageJob> {
  if (!campaignMessagesQueue) {
    const redis = getRedisClient()
    campaignMessagesQueue = new Queue(QUEUE_NAMES.CAMPAIGN_MESSAGES, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })
  }
  return campaignMessagesQueue
}

export function getCampaignNotificationsQueue(): Queue<CampaignNotificationJob> {
  if (!campaignNotificationsQueue) {
    const redis = getRedisClient()
    campaignNotificationsQueue = new Queue(QUEUE_NAMES.CAMPAIGN_NOTIFICATIONS, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2,
      },
    })
  }
  return campaignNotificationsQueue
}

export function getMessageRetryQueue(): Queue<MessageRetryJob> {
  if (!messageRetryQueue) {
    const redis = getRedisClient()
    messageRetryQueue = new Queue(QUEUE_NAMES.MESSAGE_RETRY, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    })
  }
  return messageRetryQueue
}

// Queue Events
export function getCampaignMessagesEvents(): QueueEvents {
  if (!campaignMessagesEvents) {
    const redis = getRedisClient()
    campaignMessagesEvents = new QueueEvents(QUEUE_NAMES.CAMPAIGN_MESSAGES, {
      connection: redis,
    })
  }
  return campaignMessagesEvents
}

export function getCampaignNotificationsEvents(): QueueEvents {
  if (!campaignNotificationsEvents) {
    const redis = getRedisClient()
    campaignNotificationsEvents = new QueueEvents(
      QUEUE_NAMES.CAMPAIGN_NOTIFICATIONS,
      {
        connection: redis,
      }
    )
  }
  return campaignNotificationsEvents
}

export function getMessageRetryEvents(): QueueEvents {
  if (!messageRetryEvents) {
    const redis = getRedisClient()
    messageRetryEvents = new QueueEvents(QUEUE_NAMES.MESSAGE_RETRY, {
      connection: redis,
    })
  }
  return messageRetryEvents
}

// Job processors
export async function processCampaignMessage(
  job: Job<CampaignMessageJob>
): Promise<void> {
  const {
    campaignId,
    contactId,
    phone,
    message,
    instanceId,
    instanceToken,
    clientToken,
  } = job.data

  try {
    console.log(
      `Processing campaign message for contact ${contactId} in campaign ${campaignId}`
    )

    // Create Z-API client
    const zApiClient = new ZApiClient(instanceId, instanceToken, clientToken)

    // Send message
    const result = await zApiClient.sendTextMessage(phone, message)

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message')
    }

    // Update message status in database
    const supabase = await createClient()
    const { error } = await supabase.from('whatsapp_messages').insert({
      contact_id: contactId,
      content: message,
      direction: 'outbound',
      type: 'text',
      status: 'sent',
      user_id: job.data.user_id,
      whatsapp_message_id: result.data?.messageId || null,
    })

    if (error) {
      console.error('Error saving message to database:', error)
    }

    console.log(`Successfully sent campaign message to ${phone}`)
  } catch (error) {
    console.error(`Failed to send campaign message to ${phone}:`, error)
    throw error
  }
}

export async function processCampaignNotification(
  job: Job<CampaignNotificationJob>
): Promise<void> {
  const { campaignId, status } = job.data

  try {
    console.log(
      `Processing campaign notification for campaign ${campaignId}: ${status}`
    )

    const supabase = await createClient()

    // Update campaign status
    const { error } = await supabase
      .from('campaigns')
      .update({
        status:
          status === 'started'
            ? 'running'
            : status === 'completed'
              ? 'completed'
              : 'failed',
        updated_at: new Date().toISOString(),
        ...(status === 'completed' && {
          completed_at: new Date().toISOString(),
        }),
        ...(status === 'started' && { started_at: new Date().toISOString() }),
      })
      .eq('id', campaignId)

    if (error) {
      console.error('Error updating campaign status:', error)
      throw error
    }

    console.log(
      `Successfully updated campaign ${campaignId} status to ${status}`
    )
  } catch (error) {
    console.error(
      `Failed to process campaign notification for ${campaignId}:`,
      error
    )
    throw error
  }
}

export async function processMessageRetry(
  job: Job<MessageRetryJob>
): Promise<void> {
  const {
    messageId,
    phone,
    message,
    instanceId,
    instanceToken,
    clientToken,
    retryCount,
  } = job.data

  try {
    console.log(`Retrying message ${messageId} (attempt ${retryCount})`)

    // Create Z-API client
    const zApiClient = new ZApiClient(instanceId, instanceToken, clientToken)

    // Send message
    const result = await zApiClient.sendTextMessage(phone, message)

    if (!result.success) {
      throw new Error(result.error || 'Failed to send message')
    }

    // Update message status in database
    const supabase = await createClient()
    const { error } = await supabase
      .from('whatsapp_messages')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', messageId)

    if (error) {
      console.error('Error updating message status:', error)
    }

    console.log(`Successfully retried message ${messageId}`)
  } catch (error) {
    console.error(`Failed to retry message ${messageId}:`, error)
    throw error
  }
}

// Cleanup function
export function closeAllQueues(): void {
  if (campaignMessagesQueue) {
    campaignMessagesQueue.close()
    campaignMessagesQueue = null
  }

  if (campaignNotificationsQueue) {
    campaignNotificationsQueue.close()
    campaignNotificationsQueue = null
  }

  if (messageRetryQueue) {
    messageRetryQueue.close()
    messageRetryQueue = null
  }

  if (campaignMessagesEvents) {
    campaignMessagesEvents.close()
    campaignMessagesEvents = null
  }

  if (campaignNotificationsEvents) {
    campaignNotificationsEvents.close()
    campaignNotificationsEvents = null
  }

  if (messageRetryEvents) {
    messageRetryEvents.close()
    messageRetryEvents = null
  }
}
