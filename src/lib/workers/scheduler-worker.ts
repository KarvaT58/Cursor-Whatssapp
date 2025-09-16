import { Worker } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import {
  processCampaignScheduler,
  QUEUE_NAMES,
} from '@/lib/queues/queue-manager'

let schedulerWorker: Worker | null = null

export function startSchedulerWorker(): Worker {
  if (!schedulerWorker) {
    const redis = getRedisClient()

    schedulerWorker = new Worker(
      QUEUE_NAMES.CAMPAIGN_SCHEDULER,
      async (job) => {
        console.log(`Processing campaign scheduler job ${job.id}`)
        await processCampaignScheduler(job)
      },
      {
        connection: redis,
        concurrency: 2, // Process up to 2 scheduled campaigns concurrently
      }
    )

    schedulerWorker.on('completed', (job) => {
      console.log(`Campaign scheduler job ${job.id} completed successfully`)
    })

    schedulerWorker.on('failed', (job, err) => {
      console.error(`Campaign scheduler job ${job?.id} failed:`, err)
    })

    schedulerWorker.on('error', (err) => {
      console.error('Scheduler worker error:', err)
    })

    console.log('Campaign scheduler worker started')
  }

  return schedulerWorker
}

export function stopSchedulerWorker(): void {
  if (schedulerWorker) {
    schedulerWorker.close()
    schedulerWorker = null
    console.log('Campaign scheduler worker stopped')
  }
}
