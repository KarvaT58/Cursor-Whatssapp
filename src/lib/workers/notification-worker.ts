import { Worker } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import {
  processCampaignNotification,
  QUEUE_NAMES,
} from '@/lib/queues/queue-manager'

let notificationWorker: Worker | null = null

export function startNotificationWorker(): Worker {
  if (!notificationWorker) {
    const redis = getRedisClient()

    notificationWorker = new Worker(
      QUEUE_NAMES.CAMPAIGN_NOTIFICATIONS,
      async (job) => {
        console.log(`Processing campaign notification job ${job.id}`)
        await processCampaignNotification(job)
      },
      {
        connection: redis,
        concurrency: 3,
      }
    )

    notificationWorker.on('completed', (job) => {
      console.log(`Campaign notification job ${job.id} completed successfully`)
    })

    notificationWorker.on('failed', (job, err) => {
      console.error(`Campaign notification job ${job?.id} failed:`, err)
    })

    notificationWorker.on('error', (err) => {
      console.error('Notification worker error:', err)
    })

    console.log('Notification worker started')
  }

  return notificationWorker
}

export function stopNotificationWorker(): void {
  if (notificationWorker) {
    notificationWorker.close()
    notificationWorker = null
    console.log('Notification worker stopped')
  }
}
