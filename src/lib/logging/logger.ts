// Simple logger that works in Edge Runtime
class SimpleLogger {
  private level: string

  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? 'debug' : 'warn'
  }

  private shouldLog(level: string): boolean {
    const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 }
    return levels[level as keyof typeof levels] <= levels[this.level as keyof typeof levels]
  }

  private formatMessage(level: string, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`
  }

  error(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta))
    }
  }

  warn(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta))
    }
  }

  info(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta))
    }
  }

  http(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('http')) {
      console.log(this.formatMessage('http', message, meta))
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta))
    }
  }
}

const logger = new SimpleLogger()

// Create a stream object with a 'write' function that will be used by morgan
export const morganStream = {
  write: (message: string) => {
    logger.http(message.substring(0, message.lastIndexOf('\n')))
  },
}

export default logger
