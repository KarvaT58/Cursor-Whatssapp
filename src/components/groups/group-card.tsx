'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  Users,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Bell,
  LogOut,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupCardProps {
  group: Group
  onEdit?: (group: Group) => void
  onDelete?: (groupId: string) => void
  onSync?: (groupId: string) => void
  onViewMessages?: (groupId: string) => void
  onLeave?: (groupId: string) => void
  pendingNotifications?: number
  onViewNotifications?: (groupId: string) => void
}

export function GroupCard({
  group,
  onEdit,
  onDelete,
  onSync,
  onViewMessages,
  onLeave,
  pendingNotifications = 0,
  onViewNotifications,
}: GroupCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)

  const formatLastUpdate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Há muito tempo'
    }
  }

  const getParticipantCount = () => {
    return group.participants?.length || 0
  }

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDelete = () => {
    onDelete?.(group.id)
    setShowDeleteDialog(false)
  }


  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage
                  src={`https://api.whatsapp.com/img/${group.whatsapp_id}`}
                  alt={group?.name || 'Grupo'}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getGroupInitials(group?.name || 'Grupo')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg truncate">{group?.name || 'Grupo'}</CardTitle>
                  {pendingNotifications > 0 && (
                    <div className="flex items-center gap-1">
                      <Bell className="h-4 w-4 text-orange-500" />
                      <Badge 
                        variant="destructive" 
                        className="h-5 w-5 flex items-center justify-center p-0 text-xs cursor-pointer hover:bg-red-600"
                        onClick={() => onViewNotifications?.(group.id)}
                      >
                        {pendingNotifications > 99 ? '99+' : pendingNotifications}
                      </Badge>
                    </div>
                  )}
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewMessages?.(group.id)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Abrir Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(group)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSync?.(group.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </DropdownMenuItem>
                {pendingNotifications > 0 && (
                  <DropdownMenuItem onClick={() => onViewNotifications?.(group.id)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Ver Notificações ({pendingNotifications})
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowLeaveDialog(true)}
                  className="text-orange-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair do Grupo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Estatísticas do grupo */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{getParticipantCount()} participantes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>0 mensagens</span>
              </div>
            </div>


            {/* Link Universal */}
            {group.group_type === 'universal' && group.universal_link && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-800 mb-1">Link Universal</p>
                    <p className="text-xs text-blue-600 truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}${group.universal_link}` : group.universal_link}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs ml-2"
                    onClick={() => {
                      const universalLink = typeof window !== 'undefined' 
                        ? `${window.location.origin}${group.universal_link}`
                        : group.universal_link
                      navigator.clipboard.writeText(universalLink)
                      toast.success('Link universal copiado para a área de transferência!')
                    }}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Atualizado{' '}
                {formatLastUpdate(group.updated_at || group.created_at || '')}
              </span>
              {group.whatsapp_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() =>
                    window.open(`https://wa.me/${group.whatsapp_id}`, '_blank')
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  WhatsApp
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de saída do grupo */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair do grupo &quot;{group?.name || 'Grupo'}&quot;?
              Você não receberá mais mensagens deste grupo e não poderá voltar
              a menos que seja adicionado novamente por um administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onLeave?.(group.id)
                setShowLeaveDialog(false)
              }}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              Sair do Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo &quot;{group?.name || 'Grupo'}&quot;?
              Esta ação não pode ser desfeita e todas as mensagens relacionadas
              serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  )
}
