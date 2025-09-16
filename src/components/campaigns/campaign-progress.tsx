'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useCampaignProgress } from '@/hooks/use-campaign-progress'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CampaignProgressProps {
  campaignId: string
  className?: string
  showDetails?: boolean
  autoRefresh?: boolean
}

export function CampaignProgress({
  campaignId,
  className,
  showDetails = true,
  autoRefresh = true,
}: CampaignProgressProps) {
  const { progress, isLoading, error, refresh } = useCampaignProgress({
    campaignId,
    enabled: autoRefresh,
    refreshInterval: 5000,
  })

  if (isLoading && !progress) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Carregando progresso...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <XCircle className="h-6 w-6 mr-2" />
            <span>Erro ao carregar progresso: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!progress) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nenhum progresso encontrado
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída'
      case 'failed':
        return 'Falhou'
      case 'running':
        return 'Em execução'
      case 'scheduled':
        return 'Agendada'
      case 'paused':
        return 'Pausada'
      default:
        return status
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Progresso da Campanha</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn('border', getStatusColor(progress.status))}>
              {getStatusIcon(progress.status)}
              <span className="ml-1">{getStatusText(progress.status)}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-medium">{progress.progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progress.stats.sent || 0}
            </div>
            <div className="text-xs text-muted-foreground">Enviadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {progress.stats.failed || 0}
            </div>
            <div className="text-xs text-muted-foreground">Falharam</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progress.stats.delivered || 0}
            </div>
            <div className="text-xs text-muted-foreground">Entregues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progress.stats.read || 0}
            </div>
            <div className="text-xs text-muted-foreground">Lidas</div>
          </div>
        </div>

        {/* Estimated Completion */}
        {progress.estimatedCompletion && progress.status === 'running' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Conclusão estimada:{' '}
              {formatDistanceToNow(progress.estimatedCompletion, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {/* Detailed Stats */}
        {showDetails && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Detalhes</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Total de destinatários:
                </span>
                <span className="ml-2 font-medium">
                  {(progress.stats.sent || 0) + (progress.stats.failed || 0)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de sucesso:</span>
                <span className="ml-2 font-medium">
                  {progress.stats.sent > 0
                    ? (
                        ((progress.stats.sent || 0) /
                          ((progress.stats.sent || 0) +
                            (progress.stats.failed || 0))) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Component for showing progress of multiple campaigns
interface MultipleCampaignProgressProps {
  campaignIds: string[]
  className?: string
  autoRefresh?: boolean
}

export function MultipleCampaignProgress({
  campaignIds,
  className,
  autoRefresh = true,
}: MultipleCampaignProgressProps) {
  const { progresses, isLoading, error, refresh } = useMultipleCampaignProgress(
    campaignIds,
    {
      enabled: autoRefresh,
      refreshInterval: 10000,
    }
  )

  if (isLoading && progresses.size === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Carregando progressos...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-500">
            <XCircle className="h-6 w-6 mr-2" />
            <span>Erro ao carregar progressos: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progresso das Campanhas</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {Array.from(progresses.values()).map((progress) => (
            <div key={progress.campaignId} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Campanha {progress.campaignId.slice(0, 8)}
                </span>
                <Badge variant="outline">{progress.progress.toFixed(1)}%</Badge>
              </div>
              <Progress value={progress.progress} className="h-1" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progress.stats.sent || 0} enviadas</span>
                <span>{progress.stats.failed || 0} falharam</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
