'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Play,
  Pause,
  Square,
  MoreHorizontal,
  Search,
  Calendar,
  Users,
  MessageSquare,
  Trash2,
  Edit,
} from 'lucide-react'
import { CampaignWithContacts, CampaignStatus } from '@/types/campaigns'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CampaignListProps {
  campaigns: CampaignWithContacts[]
  loading?: boolean
  onStartCampaign: (id: string) => Promise<boolean>
  onPauseCampaign: (id: string) => Promise<boolean>
  onStopCampaign: (id: string) => Promise<boolean>
  onDeleteCampaign: (id: string) => Promise<boolean>
  onEditCampaign?: (id: string) => void
}

export function CampaignList({
  campaigns,
  loading,
  onStartCampaign,
  onPauseCampaign,
  onStopCampaign,
  onDeleteCampaign,
  onEditCampaign,
}: CampaignListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>(
    'all'
  )
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const getStatusBadge = (status: CampaignStatus) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const },
      scheduled: { label: 'Agendada', variant: 'outline' as const },
      running: { label: 'Executando', variant: 'default' as const },
      completed: { label: 'Concluída', variant: 'default' as const },
      failed: { label: 'Falhou', variant: 'destructive' as const },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusColor = (status: CampaignStatus) => {
    const colors = {
      draft: 'text-gray-500',
      scheduled: 'text-blue-500',
      running: 'text-green-500',
      completed: 'text-green-600',
      failed: 'text-red-500',
    }
    return colors[status]
  }

  const canStart = (status: CampaignStatus) => {
    return status === 'draft' || status === 'scheduled'
  }

  const canPause = (status: CampaignStatus) => {
    return status === 'running'
  }

  const canStop = (status: CampaignStatus) => {
    return status === 'running' || status === 'scheduled'
  }

  const canDelete = (status: CampaignStatus) => {
    return status !== 'running'
  }

  const handleAction = async (
    action: () => Promise<boolean>,
    campaignId: string
  ) => {
    setActionLoading(campaignId)
    try {
      await action()
    } finally {
      setActionLoading(null)
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as CampaignStatus | 'all')
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="scheduled">Agendada</SelectItem>
            <SelectItem value="running">Executando</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="failed">Falhou</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma campanha encontrada
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sua primeira campanha para começar'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign?.name || 'Campanha'}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(
                          new Date(campaign.created_at),
                          'dd/MM/yyyy HH:mm',
                          { locale: ptBR }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.recipients?.length || 0} destinatários
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(campaign.status)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canStart(campaign.status) && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                () => onStartCampaign(campaign.id),
                                campaign.id
                              )
                            }
                            disabled={actionLoading === campaign.id}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar
                          </DropdownMenuItem>
                        )}
                        {canPause(campaign.status) && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                () => onPauseCampaign(campaign.id),
                                campaign.id
                              )
                            }
                            disabled={actionLoading === campaign.id}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        )}
                        {canStop(campaign.status) && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleAction(
                                () => onStopCampaign(campaign.id),
                                campaign.id
                              )
                            }
                            disabled={actionLoading === campaign.id}
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Parar
                          </DropdownMenuItem>
                        )}
                        {onEditCampaign && (
                          <DropdownMenuItem
                            onClick={() => onEditCampaign(campaign.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {canDelete(campaign.status) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Excluir Campanha
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a campanha
                                  &quot;{campaign?.name || 'Campanha'}&quot;? Esta ação não
                                  pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleAction(
                                      () => onDeleteCampaign(campaign.id),
                                      campaign.id
                                    )
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {campaign.message}
                </p>

                {/* Campaign Stats */}
                {campaign.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">
                        {campaign.stats.total}
                      </div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {campaign.stats.sent}
                      </div>
                      <div className="text-muted-foreground">Enviadas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {campaign.stats.delivered}
                      </div>
                      <div className="text-muted-foreground">Entregues</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">
                        {campaign.stats.read}
                      </div>
                      <div className="text-muted-foreground">Lidas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {campaign.stats.failed}
                      </div>
                      <div className="text-muted-foreground">Falharam</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
