'use client'

import { useState } from 'react'
import { useRealtimeGroups } from '@/hooks/use-realtime-groups'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Users,
  Calendar,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupsListProps {
  groups: Group[]
  loading: boolean
  error: string | null
  onEditGroup: (groupId: string) => void
}

export function GroupsList({
  groups,
  loading,
  error,
  onEditGroup,
}: GroupsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  // Note: These functions would need to be implemented separately
  const deleteGroup = async (id: string) => {
    console.log('Deleting group:', id)
  }
  const syncGroupFromWhatsApp = async (id: string) => {
    console.log('Syncing group from WhatsApp:', id)
  }

  const handleDeleteClick = (group: Group) => {
    setGroupToDelete(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (groupToDelete) {
      try {
        await deleteGroup(groupToDelete.id)
        setDeleteDialogOpen(false)
        setGroupToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar grupo:', error)
      }
    }
  }

  const handleSyncGroup = async (group: Group) => {
    try {
      await syncGroupFromWhatsApp(group.whatsapp_id)
    } catch (error) {
      console.error('Erro ao sincronizar grupo:', error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getParticipantCount = (participants: string[] | null) => {
    return participants ? participants.length : 0
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Nenhum grupo encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {groups.length === 0
                ? 'Você ainda não tem grupos cadastrados.'
                : 'Nenhum grupo corresponde à sua busca.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      {group.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        ID: {group.whatsapp_id}
                      </Badge>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditGroup(group.id)}>
                        <Edit className="size-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSyncGroup(group)}>
                        <RefreshCw className="size-4 mr-2" />
                        Sincronizar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(group)}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="size-4" />
                    <span>
                      {getParticipantCount(group.participants)} participantes
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>Criado em: {formatDate(group.created_at)}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="size-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o grupo &quot;{groupToDelete?.name}
              &quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
