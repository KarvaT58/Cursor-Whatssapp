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
  UserPlus,
  UserMinus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupCardProps {
  group: Group
  onEdit?: (group: Group) => void
  onDelete?: (groupId: string) => void
  onAddParticipant?: (groupId: string) => void
  onRemoveParticipant?: (groupId: string, participantPhone: string) => void
  onSync?: (groupId: string) => void
  onViewMessages?: (groupId: string) => void
}

export function GroupCard({
  group,
  onEdit,
  onDelete,
  onAddParticipant,
  onRemoveParticipant,
  onSync,
  onViewMessages,
}: GroupCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRemoveParticipantDialog, setShowRemoveParticipantDialog] =
    useState<string | null>(null)

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

  const handleRemoveParticipant = (participantPhone: string) => {
    onRemoveParticipant?.(group.id, participantPhone)
    setShowRemoveParticipantDialog(null)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={`https://api.whatsapp.com/img/${group.whatsapp_id}`}
                  alt={group.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getGroupInitials(group.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{group.name}</CardTitle>
                {group.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
                <DropdownMenuItem onClick={() => onAddParticipant?.(group.id)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Participante
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSync?.(group.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

            {/* Participantes */}
            {group.participants && group.participants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Participantes</span>
                  <Badge variant="secondary" className="text-xs">
                    {group.participants.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {group.participants.slice(0, 5).map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-muted rounded-full px-2 py-1 text-xs"
                    >
                      <span className="truncate max-w-20">{participant}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() =>
                          setShowRemoveParticipantDialog(participant)
                        }
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {group.participants.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.participants.length - 5} mais
                    </Badge>
                  )}
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

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo &quot;{group.name}&quot;?
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

      {/* Dialog de confirmação de remoção de participante */}
      <AlertDialog
        open={showRemoveParticipantDialog !== null}
        onOpenChange={() => setShowRemoveParticipantDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Participante</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o participante &quot;
              {showRemoveParticipantDialog}&quot; do grupo &quot;{group.name}
              &quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                showRemoveParticipantDialog &&
                handleRemoveParticipant(showRemoveParticipantDialog)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
