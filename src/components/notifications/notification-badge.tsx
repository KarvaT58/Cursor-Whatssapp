'use client'

import { useState, useEffect } from 'react'
import { useGroupNotifications } from '@/hooks/use-group-notifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, CheckCheck, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function NotificationBadge() {
  const { notifications, unreadCount, markAllAsRead, deleteAllNotifications } = useGroupNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Pegar as últimas 5 notificações não lidas
  const recentNotifications = notifications
    .filter(n => !n.read)
    .slice(0, 5)

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast({
        title: "Todas as notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
        variant: "default",
      })
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
      toast({
        title: "Erro ao marcar notificações",
        description: "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications()
      toast({
        title: "Todas as notificações excluídas",
        description: "Todas as notificações foram excluídas com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error('Erro ao deletar todas as notificações:', error)
      toast({
        title: "Erro ao excluir notificações",
        description: "Não foi possível excluir todas as notificações.",
        variant: "destructive",
      })
    }
  }

  const handleViewAll = () => {
    router.push('/dashboard/notifications')
    setIsOpen(false)
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    if (diff < 60000) return 'Agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h4 className="font-semibold text-sm">Notificações</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} não lidas
            </Badge>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação não lida
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer"
                onClick={() => {
                  router.push('/dashboard/notifications')
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        <div className="p-1">
          <DropdownMenuItem onClick={handleViewAll} className="cursor-pointer">
            <Eye className="h-4 w-4 mr-2" />
            Ver todas as notificações
          </DropdownMenuItem>
          
          {unreadCount > 0 && (
            <DropdownMenuItem onClick={handleMarkAllAsRead} className="cursor-pointer">
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </DropdownMenuItem>
          )}
          
          {notifications.length > 0 && (
            <DropdownMenuItem 
              onClick={handleDeleteAll} 
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todas
            </DropdownMenuItem>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}