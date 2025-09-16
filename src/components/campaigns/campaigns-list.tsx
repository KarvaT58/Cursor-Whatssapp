'use client'

import { useState } from 'react'
import { useRealtimeCampaigns } from '@/hooks/use-realtime-campaigns'
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
  Play,
  Calendar,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Megaphone,
} from 'lucide-react'

type Campaign = Database['public']['Tables']['campaigns']['Row']

interface CampaignsListProps {
  campaigns: Campaign[]
  loading: boolean
  error: string | null
  onEditCampaign: (campaignId: string) => void
}

export function CampaignsList({
  campaigns,
  loading,
  error,
  onEditCampaign,
}: CampaignsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null
  )
  const { deleteCampaign, startCampaign, completeCampaign } =
    useRealtimeCampaigns()

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (campaignToDelete) {
      try {
        await deleteCampaign(campaignToDelete.id)
        setDeleteDialogOpen(false)
        setCampaignToDelete(null)
      } catch (error) {
        console.error('Erro ao deletar campanha:', error)
      }
    }
  }

  const handleStartCampaign = async (campaign: Campaign) => {
    try {
      await startCampaign(campaign.id)
    } catch (error) {
      console.error('Erro ao iniciar campanha:', error)
    }
  }

  const handleCompleteCampaign = async (campaign: Campaign) => {
    try {
      await completeCampaign(campaign.id, {
        completed_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Erro ao completar campanha:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="size-4" />
      case 'scheduled':
        return <Clock className="size-4" />
      case 'running':
        return <Play className="size-4" />
      case 'completed':
        return <CheckCircle className="size-4" />
      case 'failed':
        return <XCircle className="size-4" />
      default:
        return <AlertCircle className="size-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'running':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      scheduled: 'Agendada',
      running: 'Em Execução',
      completed: 'Concluída',
      failed: 'Falhou',
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getRecipientCount = (recipients: string[] | null) => {
    return recipients ? recipients.length : 0
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

  if (campaigns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Nenhuma campanha encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {campaigns.length === 0
                ? 'Você ainda não tem campanhas criadas.'
                : 'Nenhuma campanha corresponde aos filtros aplicados.'}
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
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Megaphone className="size-4" />
                      {campaign.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`${getStatusColor(campaign.status || 'draft')} flex items-center gap-1`}
                      >
                        {getStatusIcon(campaign.status || 'draft')}
                        {getStatusLabel(campaign.status || 'draft')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {campaign.message}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEditCampaign(campaign.id)}
                      >
                        <Edit className="size-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {campaign.status === 'draft' && (
                        <DropdownMenuItem
                          onClick={() => handleStartCampaign(campaign)}
                        >
                          <Play className="size-4 mr-2" />
                          Iniciar
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'running' && (
                        <DropdownMenuItem
                          onClick={() => handleCompleteCampaign(campaign)}
                        >
                          <CheckCircle className="size-4 mr-2" />
                          Completar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(campaign)}
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
                      {getRecipientCount(campaign.recipients)} destinatários
                    </span>
                  </div>

                  {campaign.scheduled_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>
                        Agendada para: {formatDate(campaign.scheduled_at)}
                      </span>
                    </div>
                  )}

                  {campaign.started_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Play className="size-4" />
                      <span>
                        Iniciada em: {formatDate(campaign.started_at)}
                      </span>
                    </div>
                  )}

                  {campaign.completed_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="size-4" />
                      <span>
                        Concluída em: {formatDate(campaign.completed_at)}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="size-3 mr-1" />
                      Ver Detalhes
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
            <AlertDialogTitle>Excluir campanha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a campanha &quot;
              {campaignToDelete?.name}&quot;? Esta ação não pode ser desfeita.
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
