'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { NotificationList } from './notification-list'
import { NotificationBadge } from './notification-badge'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  action_url?: string
}

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const { unreadCount } = useRealtimeNotifications({
    onNotificationReceived: (notification) => {
      setNotifications((prev) => [notification, ...prev])
    },
    onNotificationRead: (notificationId) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
    },
  })

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleDeleteAll = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action_url) {
      window.open(notification.action_url, '_blank')
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label="Notificações"
        >
          <NotificationBadge count={unreadCount} size="md" showIcon={true} />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <NotificationList
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onNotificationClick={handleNotificationClick}
        />
      </PopoverContent>
    </Popover>
  )
}
