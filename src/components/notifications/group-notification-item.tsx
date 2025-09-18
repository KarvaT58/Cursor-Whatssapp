'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Check,
  X,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Settings,
  Clock,
  Trash2,
  Eye,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type GroupNotification = Database['public']['Tables']['group_notifications']['Row'] & {
  whatsapp_groups: {
    id: string
    name: string
    whatsapp_id: string
  } | null
}

interface GroupNotificationItemProps {
  notification: GroupNotification
  onApprove?: (notificationId: string, groupId: string, requesterPhone: string) => Promise<void>
  onReject?: (notificationId: string, groupId: string, requesterPhone: string) => Promise<void>
  onMarkAsRead?: (notificationId: string) => Promise<void>
  onDelete?: (notificationId: string) => Promise<void>
  loading?: boolean
}

export function GroupNotificationItem({
  notification,
  onApprove,
  onReject,
  onMarkAsRead,
  onDelete,
  loading = false,
}: GroupNotificationItemProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'join_request':
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'member_added':
        return <Users className="h-5 w-5 text-green-500" />
      case 'member_removed':
        return <UserMinus className="h-5 w-5 text-red-500" />
      case 'admin_promotion':
        return <Shield className="h-5 w-5 text-purple-500" />
      case 'group_updated':
        return <Settings className="h-5 w-5 text-orange-500" />
      default:
        return <Users className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'join_request':
        return 'border-l-blue-500 bg-blue-50'
      case 'member_added':
        return 'border-l-green-500 bg-green-50'
      case 'member_removed':
        return 'border-l-red-500 bg-red-50'
      case 'admin_promotion':
        return 'border-l-purple-500 bg-purple-50'
      case 'group_updated':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getNotificationBadge = () => {
    switch (notification.type) {
      case 'join_request':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Solicitação</Badge>
      case 'member_added':
        return <Badge variant="outline" className="text-green-600 border-green-200">Adicionado</Badge>
      case 'member_removed':
        return <Badge variant="outline" className="text-red-600 border-red-200">Removido</Badge>
      case 'admin_promotion':
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Admin</Badge>
      case 'group_updated':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Atualizado</Badge>
      default:
        return <Badge variant="outline">Notificação</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Há muito tempo'
    }
  }

  const handleApprove = async () => {
    if (!onApprove || !notification.data?.requester_phone) return
    
    setActionLoading(true)
    try {
      await onApprove(notification.id, notification.group_id, notification.data.requester_phone)
      setShowApproveDialog(false)
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!onReject || !notification.data?.requester_phone) return
    
    setActionLoading(true)
    try {
      await onReject(notification.id, notification.group_id, notification.data.requester_phone)
      setShowRejectDialog(false)
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkAsRead = async () => {
    if (!onMarkAsRead) return
    
    try {
      await onMarkAsRead(notification.id)
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    setActionLoading(true)
    try {
      await onDelete(notification.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error('Erro ao deletar notificação:', error)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      <Card className={`border-l-4 ${getNotificationColor()} ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage
                  src={`https://api.whatsapp.com/img/${notification.whatsapp_groups?.whatsapp_id}`}
                  alt={notification.whatsapp_groups?.name || 'Grupo'}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getNotificationIcon()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                  {getNotificationBadge()}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimestamp(notification.created_at)}</span>
                  {notification.whatsapp_groups && (
                    <>
                      <span>•</span>
                      <span className="truncate">{notification.whatsapp_groups.name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAsRead}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {notification.type === 'join_request' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApproveDialog(true)}
                    disabled={loading || actionLoading}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading || actionLoading}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading || actionLoading}
                className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dialog de aprovação */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar a entrada de{' '}
              <strong>{notification.data?.requester_phone}</strong> no grupo{' '}
              <strong>{notification.whatsapp_groups?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? 'Aprovando...' : 'Aprovar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de rejeição */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar a entrada de{' '}
              <strong>{notification.data?.requester_phone}</strong> no grupo{' '}
              <strong>{notification.whatsapp_groups?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Rejeitando...' : 'Rejeitar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Notificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
