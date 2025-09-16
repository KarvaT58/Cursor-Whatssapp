import { Worker } from 'bullmq'
import { getRedisClient } from '@/lib/redis/client'
import { processMessageRetry, QUEUE_NAMES } from '@/lib/queues/queue-manager'

let retryWorker: Worker | null = null

export function startRetryWorker(): Worker {
  if (!retryWorker) {
    const redis = getRedisClient()

    retryWorker = new Worker(
      QUEUE_NAMES.MESSAGE_RETRY,
      async (job) => {
        console.log(`Processing message retry job ${job.id}`)
        await processMessageRetry(job)
      },
      {
        connection: redis,
        concurrency: 3,
      }
    )

    retryWorker.on('completed', (job) => {
      console.log(`Message retry job ${job.id} completed successfully`)
    })

    retryWorker.on('failed', (job, err) => {
      console.error(`Message retry job ${job?.id} failed:`, err)
    })

    retryWorker.on('error', (err) => {
      console.error('Retry worker error:', err)
    })

    console.log('Retry worker started')
  }

  return retryWorker
}

export function stopRetryWorker(): void {
  if (retryWorker) {
    retryWorker.close()
    retryWorker = null
    console.log('Retry worker stopped')
  }
}
