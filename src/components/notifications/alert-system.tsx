'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

interface Alert {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  dismissible?: boolean
  autoClose?: boolean
  duration?: number
}

interface AlertSystemProps {
  className?: string
  maxAlerts?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function AlertSystem({
  className,
  maxAlerts = 5,
  position = 'top-right',
}: AlertSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useRealtimeNotifications({
    onSystemAlert: (alert) => {
      const newAlert: Alert = {
        id: `alert-${Date.now()}-${Math.random()}`,
        type: alert.type as Alert['type'],
        title: alert.message,
        message: alert.message,
        timestamp: new Date().toISOString(),
        dismissible: true,
        autoClose: true,
        duration: 5000,
      }

      setAlerts((prev) => {
        const updated = [newAlert, ...prev]
        return updated.slice(0, maxAlerts)
      })

      // Auto close if enabled
      if (newAlert.autoClose && newAlert.duration) {
        setTimeout(() => {
          setAlerts((prev) => prev.filter((a) => a.id !== newAlert.id))
        }, newAlert.duration)
      }
    },
  })

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const dismissAll = () => {
    setAlerts([])
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'warning':
        return 'destructive'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed z-50 space-y-2',
        positionClasses[position],
        className
      )}
    >
      {alerts.length > 1 && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={dismissAll}
            className="h-6 px-2 text-xs"
          >
            Limpar todas
          </Button>
        </div>
      )}

      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={getAlertVariant(alert.type)}
          className={cn(
            'w-80 shadow-lg border-l-4',
            alert.type === 'success' && 'border-l-green-500',
            alert.type === 'warning' && 'border-l-yellow-500',
            alert.type === 'error' && 'border-l-red-500',
            alert.type === 'info' && 'border-l-blue-500'
          )}
        >
          <div className="flex items-start gap-2">
            {getAlertIcon(alert.type)}
            <div className="flex-1">
              <AlertTitle className="text-sm font-medium">
                {alert.title}
              </AlertTitle>
              <AlertDescription className="text-sm text-muted-foreground mt-1">
                {alert.message}
              </AlertDescription>
            </div>

            {alert.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </Alert>
      ))}
    </div>
  )
}
