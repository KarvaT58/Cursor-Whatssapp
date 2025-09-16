'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  BellOff,
  MessageSquare,
  UserPlus,
  UserMinus,
  Settings,
  X,
} from 'lucide-react'
import { TeamMessageWithUser, TeamActivity } from '@/types/teams'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface TeamNotification {
  id: string
  type:
    | 'message'
    | 'member_joined'
    | 'member_left'
    | 'role_changed'
    | 'team_updated'
  title: string
  description: string
  timestamp: string
  isRead: boolean
  userId?: string
  userName?: string
  messageId?: string
}

interface TeamNotificationsProps {
  teamId: string
  notifications: TeamNotification[]
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  onClearNotification: (notificationId: string) => void
  onClearAllNotifications: () => void
  className?: string
}

export function TeamNotifications({
  teamId,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onClearAllNotifications,
  className,
}: TeamNotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: TeamNotification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />
      case 'member_joined':
        return <UserPlus className="h-4 w-4" />
      case 'member_left':
        return <UserMinus className="h-4 w-4" />
      case 'role_changed':
        return <Settings className="h-4 w-4" />
      case 'team_updated':
        return <Settings className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: TeamNotification['type']) => {
    switch (type) {
      case 'message':
        return 'text-blue-600'
      case 'member_joined':
        return 'text-green-600'
      case 'member_left':
        return 'text-red-600'
      case 'role_changed':
        return 'text-yellow-600'
      case 'team_updated':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const handleNotificationClick = (notification: TeamNotification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }

    // TODO: Navigate to relevant content based on notification type
    switch (notification.type) {
      case 'message':
        // Scroll to message in chat
        break
      case 'member_joined':
      case 'member_left':
      case 'role_changed':
        // Navigate to team members page
        break
      case 'team_updated':
        // Navigate to team settings
        break
    }
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            <CardTitle className="text-sm">Notificações</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <X className="h-3 w-3" />
              ) : (
                <Bell className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Notification Controls */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="text-xs"
              >
                {notificationsEnabled ? 'Desabilitar' : 'Habilitar'}{' '}
                Notificações
              </Button>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-64">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      icon={getNotificationIcon(notification.type)}
                      color={getNotificationColor(notification.type)}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => onMarkAsRead(notification.id)}
                      onClear={() => onClearNotification(notification.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Clear All Button */}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllNotifications}
                className="w-full text-xs text-muted-foreground"
              >
                Limpar todas as notificações
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Notification Item Component
interface NotificationItemProps {
  notification: TeamNotification
  icon: React.ReactNode
  color: string
  onClick: () => void
  onMarkAsRead: () => void
  onClear: () => void
}

function NotificationItem({
  notification,
  icon,
  color,
  onClick,
  onMarkAsRead,
  onClear,
}: NotificationItemProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-colors',
        notification.isRead
          ? 'bg-muted/30 border-muted'
          : 'bg-primary/5 border-primary/20'
      )}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0', color)}>{icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium truncate">
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {notification.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            {showActions && (
              <div className="flex items-center gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onMarkAsRead()
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    Marcar como lida
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
