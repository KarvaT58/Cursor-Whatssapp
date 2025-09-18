'use client'

import { useState, useEffect } from 'react'
import { useGroupNotifications } from '@/hooks/use-group-notifications'
import { GroupNotificationItem } from './group-notification-item'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  RefreshCw,
  Filter,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function GroupNotifications() {
  const {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    approveJoinRequest,
    rejectJoinRequest,
  } = useGroupNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'join_requests'>('all')
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'join_requests':
        return notification.type === 'join_request'
      default:
        return true
    }
  })

  // Aprovar solicitação
  const handleApprove = async (notificationId: string, groupId: string, requesterPhone: string) => {
    setActionLoading(true)
    try {
      await approveJoinRequest(notificationId, groupId, requesterPhone)
      toast({
        title: "Solicitação aprovada!",
        description: `O usuário ${requesterPhone} foi adicionado ao grupo com sucesso.`,
        variant: "success",
      })
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error)
      toast({
        title: "Erro ao aprovar solicitação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Rejeitar solicitação
  const handleReject = async (notificationId: string, groupId: string, requesterPhone: string) => {
    setActionLoading(true)
    try {
      await rejectJoinRequest(notificationId, groupId, requesterPhone)
      toast({
        title: "Solicitação rejeitada",
        description: `A solicitação de entrada do usuário ${requesterPhone} foi rejeitada.`,
        variant: "default",
      })
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
      toast({
        title: "Erro ao rejeitar solicitação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Marcar como lida
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
      toast({
        title: "Erro ao marcar notificação",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      })
    }
  }

  // Deletar notificação
  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      toast({
        title: "Notificação excluída",
        description: "A notificação foi excluída com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
      toast({
        title: "Erro ao excluir notificação",
        description: "Não foi possível excluir a notificação.",
        variant: "destructive",
      })
    }
  }

  // Marcar todas como lidas
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

  // Deletar todas as notificações
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

  // Atualizar notificações
  const handleRefresh = async () => {
    try {
      await fetchNotifications()
      toast({
        title: "Notificações atualizadas",
        description: "As notificações foram atualizadas com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error('Erro ao atualizar notificações:', error)
      toast({
        title: "Erro ao atualizar notificações",
        description: "Não foi possível atualizar as notificações.",
        variant: "destructive",
      })
    }
  }

  // Loading skeleton
  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar notificações: {error}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Notificações de Grupos</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={actionLoading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar todas
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas ({notifications.length})</SelectItem>
            <SelectItem value="unread">Não lidas ({unreadCount})</SelectItem>
            <SelectItem value="join_requests">
              Solicitações ({notifications.filter(n => n.type === 'join_request').length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de notificações */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === 'unread' 
                ? 'Nenhuma notificação não lida'
                : filter === 'join_requests'
                ? 'Nenhuma solicitação de entrada'
                : 'Nenhuma notificação ainda'
              }
            </h3>
            <p className="text-muted-foreground">
              {filter === 'unread'
                ? 'Todas as suas notificações foram lidas.'
                : filter === 'join_requests'
                ? 'Não há solicitações de entrada pendentes.'
                : 'Você receberá notificações quando houver atividade nos seus grupos.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <GroupNotificationItem
              key={notification.id}
              notification={notification}
              onApprove={handleApprove}
              onReject={handleReject}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
