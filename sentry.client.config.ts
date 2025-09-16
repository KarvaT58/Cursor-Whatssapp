import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 0.1,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Filter out common non-critical errors
        if (
          error.message.includes('ResizeObserver loop limit exceeded') ||
          error.message.includes('Non-Error promise rejection captured') ||
          error.message.includes('Loading chunk')
        ) {
          return null
        }
      }
    }
    
    return event
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'whatsapp-professional-saas',
    },
  },
})
