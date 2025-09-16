import { startCampaignWorker, stopCampaignWorker } from './campaign-worker'
import {
  startNotificationWorker,
  stopNotificationWorker,
} from './notification-worker'
import { startRetryWorker, stopRetryWorker } from './retry-worker'

let workersStarted = false

export function startAllWorkers(): void {
  if (workersStarted) {
    console.log('Workers already started')
    return
  }

  try {
    startCampaignWorker()
    startNotificationWorker()
    startRetryWorker()

    workersStarted = true
    console.log('All workers started successfully')
  } catch (error) {
    console.error('Error starting workers:', error)
    stopAllWorkers()
    throw error
  }
}

export function stopAllWorkers(): void {
  if (!workersStarted) {
    console.log('Workers not started')
    return
  }

  try {
    stopCampaignWorker()
    stopNotificationWorker()
    stopRetryWorker()

    workersStarted = false
    console.log('All workers stopped successfully')
  } catch (error) {
    console.error('Error stopping workers:', error)
  }
}

export function isWorkersStarted(): boolean {
  return workersStarted
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, stopping workers...')
  stopAllWorkers()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, stopping workers...')
  stopAllWorkers()
  process.exit(0)
})
