import { Worker } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import { processCampaignMessage, QUEUE_NAMES } from '@/lib/queues/queue-manager'

let campaignWorker: Worker | null = null

export function startCampaignWorker(): Worker {
  if (!campaignWorker) {
    const redis = getRedisClient()

    campaignWorker = new Worker(
      QUEUE_NAMES.CAMPAIGN_MESSAGES,
      async (job) => {
        console.log(`Processing campaign message job ${job.id}`)
        await processCampaignMessage(job)
      },
      {
        connection: redis,
        concurrency: 5, // Process up to 5 messages concurrently
      }
    )

    campaignWorker.on('completed', (job) => {
      console.log(`Campaign message job ${job.id} completed successfully`)
    })

    campaignWorker.on('failed', (job, err) => {
      console.error(`Campaign message job ${job?.id} failed:`, err)
    })

    campaignWorker.on('error', (err) => {
      console.error('Campaign worker error:', err)
    })

    console.log('Campaign worker started')
  }

  return campaignWorker
}

export function stopCampaignWorker(): void {
  if (campaignWorker) {
    campaignWorker.close()
    campaignWorker = null
    console.log('Campaign worker stopped')
  }
}
