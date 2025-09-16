'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { usePushNotifications } from './use-push-notifications'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action_url?: string
}

interface NotificationPreferences {
  enabled: boolean
  sound: boolean
  desktop: boolean
  mobile: boolean
  email: boolean
  chat: boolean
  campaigns: boolean
  messages: boolean
  groups: boolean
  system: boolean
}

export function useNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    desktop: true,
    mobile: false,
    email: false,
    chat: true,
    campaigns: true,
    messages: true,
    groups: true,
    system: true,
  })

  const { showNotification: showPushNotification } = usePushNotifications()

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback(
    (newPreferences: NotificationPreferences) => {
      localStorage.setItem(
        'notification-preferences',
        JSON.stringify(newPreferences)
      )
      setPreferences(newPreferences)
    },
    []
  )

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])

      // Show toast notification
      if (preferences.enabled) {
        switch (notification.type) {
          case 'success':
            toast.success(notification.title, {
              description: notification.message,
              duration: 5000,
            })
            break
          case 'warning':
            toast.warning(notification.title, {
              description: notification.message,
              duration: 7000,
            })
            break
          case 'error':
            toast.error(notification.title, {
              description: notification.message,
              duration: 10000,
            })
            break
          default:
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
            })
        }
      }

      // Show push notification if enabled
      if (preferences.enabled && preferences.desktop) {
        showPushNotification({
          title: notification.title,
          body: notification.message,
          data: notification.action_url
            ? { url: notification.action_url }
            : undefined,
        })
      }

      return newNotification.id
    },
    [preferences, showPushNotification]
  )

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Delete all notifications
  const deleteAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  // Notification helpers for different types
  const notifySuccess = useCallback(
    (title: string, message: string, actionUrl?: string) => {
      return addNotification({
        type: 'success',
        title,
        message,
        action_url: actionUrl,
      })
    },
    [addNotification]
  )

  const notifyError = useCallback(
    (title: string, message: string, actionUrl?: string) => {
      return addNotification({
        type: 'error',
        title,
        message,
        action_url: actionUrl,
      })
    },
    [addNotification]
  )

  const notifyWarning = useCallback(
    (title: string, message: string, actionUrl?: string) => {
      return addNotification({
        type: 'warning',
        title,
        message,
        action_url: actionUrl,
      })
    },
    [addNotification]
  )

  const notifyInfo = useCallback(
    (title: string, message: string, actionUrl?: string) => {
      return addNotification({
        type: 'info',
        title,
        message,
        action_url: actionUrl,
      })
    },
    [addNotification]
  )

  // Specific notification types
  const notifyCampaign = useCallback(
    (message: string, actionUrl?: string) => {
      if (preferences.campaigns) {
        return notifySuccess('Campanha', message, actionUrl)
      }
    },
    [preferences.campaigns, notifySuccess]
  )

  const notifyMessage = useCallback(
    (message: string, actionUrl?: string) => {
      if (preferences.messages) {
        return notifyInfo('Mensagem', message, actionUrl)
      }
    },
    [preferences.messages, notifyInfo]
  )

  const notifyGroup = useCallback(
    (message: string, actionUrl?: string) => {
      if (preferences.groups) {
        return notifyInfo('Grupo', message, actionUrl)
      }
    },
    [preferences.groups, notifyInfo]
  )

  const notifySystem = useCallback(
    (message: string, actionUrl?: string) => {
      if (preferences.system) {
        return notifyWarning('Sistema', message, actionUrl)
      }
    },
    [preferences.system, notifyWarning]
  )

  return {
    notifications,
    preferences,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    savePreferences,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyCampaign,
    notifyMessage,
    notifyGroup,
    notifySystem,
  }
}
