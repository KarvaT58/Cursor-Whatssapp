import * as Sentry from '@sentry/nextjs'

// Initialize Sentry
export function initSentry() {
  if (process.env.NODE_ENV === 'production') {
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
  }
}

// Custom error reporting functions
export const errorReporting = {
  captureException: (error: Error, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach((key) => {
            scope.setContext(key, context[key])
          })
        }
        Sentry.captureException(error)
      })
    }
  },

  captureMessage: (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        if (context) {
          Object.keys(context).forEach((key) => {
            scope.setContext(key, context[key])
          })
        }
        Sentry.captureMessage(message, level)
      })
    }
  },

  setUser: (user: { id: string; email?: string; teamId?: string }) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        team_id: user.teamId,
      })
    }
  },

  addBreadcrumb: (breadcrumb: Sentry.Breadcrumb) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb(breadcrumb)
    }
  },

  setContext: (key: string, context: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setContext(key, context)
    }
  },

  setTag: (key: string, value: string) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setTag(key, value)
    }
  },
}

// Performance monitoring
export const performanceMonitoring = {
  startTransaction: (name: string, op: string) => {
    if (process.env.NODE_ENV === 'production') {
      return Sentry.startTransaction({ name, op })
    }
    return null
  },

  startSpan: (transaction: any, name: string, op: string) => {
    if (process.env.NODE_ENV === 'production' && transaction) {
      return transaction.startChild({ name, op })
    }
    return null
  },

  finishSpan: (span: any) => {
    if (process.env.NODE_ENV === 'production' && span) {
      span.finish()
    }
  },

  finishTransaction: (transaction: any) => {
    if (process.env.NODE_ENV === 'production' && transaction) {
      transaction.finish()
    }
  },
}

// API route error handler
export function withSentryErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      errorReporting.captureException(error as Error, {
        handler: handler.name,
        args: args.length,
      })
      throw error
    }
  }
}

// React component error boundary
export function withSentryErrorBoundary(Component: React.ComponentType<Record<string, unknown>>) {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Algo deu errado!
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true)
      scope.setContext('errorInfo', errorInfo)
    },
  })
}
