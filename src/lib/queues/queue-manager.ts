import { Queue, Job, QueueEvents } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import { ZApiClient } from '@/lib/z-api/client'
import { createClient } from '@/lib/supabase/server'
import {
  whatsappRateLimiter,
  campaignRateLimiter,
  retryRateLimiter,
} from '@/lib/rate-limiter'

// Queue names
export const QUEUE_NAMES = {
  CAMPAIGN_MESSAGES: 'campaign-messages',
  CAMPAIGN_NOTIFICATIONS: 'campaign-notifications',
  MESSAGE_RETRY: 'message-retry',
  CAMPAIGN_SCHEDULER: 'campaign-scheduler',
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

export interface CampaignSchedulerJob {
  campaignId: string
  scheduledAt: string
  userId: string
}

// Queue instances
let campaignMessagesQueue: Queue<CampaignMessageJob> | null = null
let campaignNotificationsQueue: Queue<CampaignNotificationJob> | null = null
let messageRetryQueue: Queue<MessageRetryJob> | null = null
let campaignSchedulerQueue: Queue<CampaignSchedulerJob> | null = null

// Queue events
let campaignMessagesEvents: QueueEvents | null = null
let campaignNotificationsEvents: QueueEvents | null = null
let messageRetryEvents: QueueEvents | null = null
let campaignSchedulerEvents: QueueEvents | null = null

export function getCampaignMessagesQueue(): Queue<CampaignMessageJob> {
  if (!campaignMessagesQueue) {
    try {
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
    } catch (error) {
      console.error('Failed to create campaign messages queue:', error)
      throw error
    }
  }
  return campaignMessagesQueue
}

export function getCampaignNotificationsQueue(): Queue<CampaignNotificationJob> {
  if (!campaignNotificationsQueue) {
    try {
      const redis = getRedisClient()
      campaignNotificationsQueue = new Queue(
        QUEUE_NAMES.CAMPAIGN_NOTIFICATIONS,
        {
          connection: redis,
          defaultJobOptions: {
            removeOnComplete: 50,
            removeOnFail: 25,
            attempts: 2,
          },
        }
      )
    } catch (error) {
      console.error('Failed to create campaign notifications queue:', error)
      throw error
    }
  }
  return campaignNotificationsQueue
}

export function getMessageRetryQueue(): Queue<MessageRetryJob> {
  if (!messageRetryQueue) {
    try {
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
    } catch (error) {
      console.error('Failed to create message retry queue:', error)
      throw error
    }
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

export function getCampaignSchedulerQueue(): Queue<CampaignSchedulerJob> {
  if (!campaignSchedulerQueue) {
    const redis = getRedisClient()
    campaignSchedulerQueue = new Queue(QUEUE_NAMES.CAMPAIGN_SCHEDULER, {
      connection: redis,
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 3,
      },
    })
  }
  return campaignSchedulerQueue
}

export function getCampaignSchedulerEvents(): QueueEvents {
  if (!campaignSchedulerEvents) {
    const redis = getRedisClient()
    campaignSchedulerEvents = new QueueEvents(QUEUE_NAMES.CAMPAIGN_SCHEDULER, {
      connection: redis,
    })
  }
  return campaignSchedulerEvents
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
    user_id,
  } = job.data

  try {
    console.log(
      `Processing campaign message for contact ${contactId} in campaign ${campaignId}`
    )

    // Check rate limits
    const [whatsappLimit, campaignLimit] = await Promise.all([
      whatsappRateLimiter.checkLimit(instanceId),
      campaignRateLimiter.checkLimit(user_id || 'anonymous'),
    ])

    if (!whatsappLimit.allowed) {
      const retryAfter = whatsappLimit.retryAfter || 60
      console.log(
        `WhatsApp rate limit exceeded for instance ${instanceId}, retrying after ${retryAfter}s`
      )

      // Reschedule job with delay
      await job.moveToDelayed(Date.now() + retryAfter * 1000)
      return
    }

    if (!campaignLimit.allowed) {
      const retryAfter = campaignLimit.retryAfter || 60
      console.log(
        `Campaign rate limit exceeded for user ${user_id}, retrying after ${retryAfter}s`
      )

      // Reschedule job with delay
      await job.moveToDelayed(Date.now() + retryAfter * 1000)
      return
    }

    // Create Z-API client
    const zApiClient = new ZApiClient(instanceId, instanceToken, clientToken)

    // Send message
    const result = await zApiClient.sendTextMessage(phone, message)

    if (!result.success) {
      // Check if it's a rate limit error from Z-API
      if (
        result.error?.includes('rate limit') ||
        result.error?.includes('too many requests')
      ) {
        console.log(`Z-API rate limit hit, retrying after 60s`)
        await job.moveToDelayed(Date.now() + 60000)
        return
      }

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
      user_id: user_id,
      whatsapp_message_id: result.data?.messageId || null,
    })

    if (error) {
      console.error('Error saving message to database:', error)
    }

    // Update campaign progress
    await updateCampaignProgress(campaignId, 'sent')

    console.log(`Successfully sent campaign message to ${phone}`)
  } catch (error) {
    console.error(`Failed to send campaign message to ${phone}:`, error)

    // Update campaign progress for failed message
    await updateCampaignProgress(campaignId, 'failed')

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

    // Check retry rate limit
    const retryLimit = await retryRateLimiter.checkLimit(messageId)
    if (!retryLimit.allowed) {
      const retryAfter = retryLimit.retryAfter || 300
      console.log(
        `Retry rate limit exceeded for message ${messageId}, retrying after ${retryAfter}s`
      )
      await job.moveToDelayed(Date.now() + retryAfter * 1000)
      return
    }

    // Check WhatsApp rate limit
    const whatsappLimit = await whatsappRateLimiter.checkLimit(instanceId)
    if (!whatsappLimit.allowed) {
      const retryAfter = whatsappLimit.retryAfter || 60
      console.log(
        `WhatsApp rate limit exceeded for instance ${instanceId}, retrying after ${retryAfter}s`
      )
      await job.moveToDelayed(Date.now() + retryAfter * 1000)
      return
    }

    // Create Z-API client
    const zApiClient = new ZApiClient(instanceId, instanceToken, clientToken)

    // Send message
    const result = await zApiClient.sendTextMessage(phone, message)

    if (!result.success) {
      // Check if it's a rate limit error from Z-API
      if (
        result.error?.includes('rate limit') ||
        result.error?.includes('too many requests')
      ) {
        console.log(`Z-API rate limit hit during retry, retrying after 60s`)
        await job.moveToDelayed(Date.now() + 60000)
        return
      }

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

export async function processCampaignScheduler(
  job: Job<CampaignSchedulerJob>
): Promise<void> {
  const { campaignId, userId } = job.data

  try {
    console.log(`Processing scheduled campaign ${campaignId}`)

    const supabase = await createClient()

    // Get campaign details
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !campaign) {
      throw new Error('Campaign not found or access denied')
    }

    // Check if campaign is still scheduled and not already started
    if (campaign.status !== 'scheduled') {
      console.log(
        `Campaign ${campaignId} is no longer scheduled (status: ${campaign.status})`
      )
      return
    }

    // Check if it's time to start the campaign
    const scheduledTime = new Date(campaign.scheduled_at || '')
    const now = new Date()

    if (scheduledTime > now) {
      // Reschedule for the correct time
      const delay = scheduledTime.getTime() - now.getTime()
      console.log(
        `Campaign ${campaignId} not ready yet, rescheduling in ${delay}ms`
      )
      await job.moveToDelayed(delay)
      return
    }

    // Get Z-API instance for the user
    const { data: zApiInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (instanceError || !zApiInstance) {
      throw new Error('No active Z-API instance found')
    }

    // Update campaign status to running
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    if (updateError) {
      throw new Error('Failed to update campaign status')
    }

    // Add campaign notification job
    const campaignNotificationsQueue = getCampaignNotificationsQueue()
    await campaignNotificationsQueue.add('campaign-started', {
      campaignId,
      status: 'started',
    })

    // Add individual message jobs for each recipient
    const campaignMessagesQueue = getCampaignMessagesQueue()

    if (!campaign.recipients || campaign.recipients.length === 0) {
      throw new Error('Campaign has no recipients')
    }

    // Fetch contact phone numbers
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, phone')
      .in('id', campaign.recipients)
      .eq('user_id', userId)

    const contactPhoneMap = new Map(contacts?.map((c) => [c.id, c.phone]) || [])

    // Add jobs with phone numbers
    const messageJobs = campaign.recipients
      .filter((contactId: string) => contactPhoneMap.has(contactId))
      .map((contactId: string) => ({
        campaignId,
        contactId,
        phone: contactPhoneMap.get(contactId)!,
        message: campaign.message,
        instanceId: zApiInstance.instance_id,
        instanceToken: zApiInstance.instance_token,
        clientToken: zApiInstance.client_token,
        user_id: userId,
      }))

    // Add all message jobs to the queue with a small delay between each
    for (let i = 0; i < messageJobs.length; i++) {
      const job = messageJobs[i]
      await campaignMessagesQueue.add('send-campaign-message', job, {
        priority: 1,
        delay: i * 1000, // 1 second delay between each message
      })
    }

    console.log(
      `Successfully started scheduled campaign ${campaignId} with ${messageJobs.length} messages`
    )
  } catch (error) {
    console.error(`Failed to process scheduled campaign ${campaignId}:`, error)
    throw error
  }
}

// Helper function to update campaign progress
async function updateCampaignProgress(
  campaignId: string,
  status: 'sent' | 'failed'
): Promise<void> {
  try {
    const supabase = await createClient()

    // Get current campaign stats
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('stats')
      .eq('id', campaignId)
      .single()

    if (!campaign) return

    const currentStats = campaign.stats || { sent: 0, failed: 0, total: 0 }

    // Update stats
    const updatedStats = {
      ...currentStats,
      [status]: (currentStats[status] || 0) + 1,
      total: (currentStats.total || 0) + 1,
    }

    // Update campaign with new stats
    await supabase
      .from('campaigns')
      .update({
        stats: updatedStats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
  } catch (error) {
    console.error('Error updating campaign progress:', error)
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

  if (campaignSchedulerQueue) {
    campaignSchedulerQueue.close()
    campaignSchedulerQueue = null
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

  if (campaignSchedulerEvents) {
    campaignSchedulerEvents.close()
    campaignSchedulerEvents = null
  }
}
