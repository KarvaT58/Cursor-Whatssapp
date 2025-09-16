'use client'

import { useEffect, useState } from 'react'
import { useRealtime } from '@/providers/realtime-provider'
import { RealtimeChannel } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action_url?: string
}

interface UseRealtimeNotificationsProps {
  onNotificationReceived?: (notification: Notification) => void
  onNotificationRead?: (notificationId: string) => void
  onSystemAlert?: (alert: { type: string; message: string }) => void
}

export function useRealtimeNotifications({
  onNotificationReceived,
  onNotificationRead,
  onSystemAlert,
}: UseRealtimeNotificationsProps = {}) {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  const [channels, setChannels] = useState<RealtimeChannel[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Subscribe to notifications
  useEffect(() => {
    if (!isConnected) return

    const notificationsChannel = subscribe('notifications', (payload) => {
      console.log('Notification update received:', payload)

      if (payload.eventType === 'INSERT' && payload.new) {
        const notification = payload.new as Notification
        onNotificationReceived?.(notification)

        // Show toast notification
        const toastOptions = {
          duration: 5000,
          action: notification.action_url
            ? {
                label: 'Ver',
                onClick: () => window.open(notification.action_url, '_blank'),
              }
            : undefined,
        }

        switch (notification.type) {
          case 'success':
            toast.success(notification.title, toastOptions)
            break
          case 'error':
            toast.error(notification.title, toastOptions)
            break
          case 'warning':
            toast.warning(notification.title, toastOptions)
            break
          default:
            toast(notification.title, toastOptions)
        }

        if (!notification.read) {
          setUnreadCount((prev) => prev + 1)
        }
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const notification = payload.new as Notification
        const oldNotification = payload.old as Notification
        if (oldNotification?.read !== notification.read && notification.read) {
          onNotificationRead?.(notification.id)
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    })

    setChannels((prev) => [...prev, notificationsChannel])

    return () => {
      unsubscribe(notificationsChannel)
      setChannels((prev) => prev.filter((c) => c !== notificationsChannel))
    }
  }, [
    isConnected,
    onNotificationReceived,
    onNotificationRead,
    subscribe,
    unsubscribe,
  ])

  // Subscribe to system alerts
  useEffect(() => {
    if (!isConnected) return

    const systemAlertsChannel = subscribe('system_alerts', (payload) => {
      console.log('System alert received:', payload)

      if (payload.eventType === 'INSERT' && payload.new) {
        const alert = payload.new as { alert_type?: string; message?: string }
        onSystemAlert?.({
          type: alert.alert_type || 'info',
          message: alert.message || 'Alerta do sistema',
        })

        // Show system alert toast
        switch (alert.alert_type) {
          case 'maintenance':
            toast.warning(`Manutenção: ${alert.message}`, { duration: 10000 })
            break
          case 'outage':
            toast.error(`Indisponibilidade: ${alert.message}`, {
              duration: 10000,
            })
            break
          case 'update':
            toast.info(`Atualização: ${alert.message}`, { duration: 8000 })
            break
          default:
            toast(alert.message || 'Alerta do sistema', { duration: 6000 })
        }
      }
    })

    setChannels((prev) => [...prev, systemAlertsChannel])

    return () => {
      unsubscribe(systemAlertsChannel)
      setChannels((prev) => prev.filter((c) => c !== systemAlertsChannel))
    }
  }, [isConnected, onSystemAlert, subscribe, unsubscribe])

  // Cleanup all channels on unmount
  useEffect(() => {
    return () => {
      channels.forEach((channel) => unsubscribe(channel))
    }
  }, [channels, unsubscribe])

  return {
    isConnected,
    channelsCount: channels.length,
    unreadCount,
  }
}
