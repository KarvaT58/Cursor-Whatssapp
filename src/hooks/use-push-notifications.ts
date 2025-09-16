'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'

interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
}

interface PushNotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: Record<string, unknown>
  requireInteraction?: boolean
  silent?: boolean
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: false,
  })

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator
    const permission = isSupported ? Notification.permission : 'denied'

    setState((prev) => ({
      ...prev,
      isSupported,
      permission,
    }))
  }, [])

  // Request permission for push notifications
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error('Notificações push não são suportadas neste navegador')
      return false
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const permission = await Notification.requestPermission()

      setState((prev) => ({
        ...prev,
        permission,
        isLoading: false,
      }))

      if (permission === 'granted') {
        toast.success('Permissão para notificações concedida!')
        return true
      } else if (permission === 'denied') {
        toast.error('Permissão para notificações negada')
        return false
      } else {
        toast.warning('Permissão para notificações não foi concedida')
        return false
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Erro ao solicitar permissão para notificações')
      return false
    }
  }, [state.isSupported])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission()
      if (!hasPermission) return false
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      // Send subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          isLoading: false,
        }))
        toast.success('Inscrito em notificações push!')
        return true
      } else {
        throw new Error('Failed to subscribe to push notifications')
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Erro ao se inscrever em notificações push')
      return false
    }
  }, [state.isSupported, state.permission, requestPermission])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // Notify server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        })

        setState((prev) => ({
          ...prev,
          isSubscribed: false,
          isLoading: false,
        }))
        toast.success('Desinscrito das notificações push!')
        return true
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      setState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Erro ao se desinscrever das notificações push')
      return false
    }

    setState((prev) => ({ ...prev, isLoading: false }))
    return false
  }, [])

  // Show local notification
  const showNotification = useCallback(
    (options: PushNotificationOptions) => {
      if (!state.isSupported || state.permission !== 'granted') {
        toast.error('Notificações não estão disponíveis')
        return
      }

      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192x192.png',
        badge: options.badge || '/icon-192x192.png',
        tag: options.tag,
        data: options.data,
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        notification.close()

        if (options.data?.url && typeof options.data.url === 'string') {
          window.open(options.data.url, '_blank')
        }
      }

      return notification
    },
    [state.isSupported, state.permission]
  )

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (state.isSupported && state.permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.getSubscription()

          setState((prev) => ({
            ...prev,
            isSubscribed: !!subscription,
          }))
        } catch (error) {
          console.error('Error checking subscription:', error)
        }
      }
    }

    checkSubscription()
  }, [state.isSupported, state.permission])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  }
}
