'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  MousePointer,
} from 'lucide-react'

interface CampaignStatsProps {
  stats: {
    totalCampaigns: number
    activeCampaigns: number
    completedCampaigns: number
    totalRecipients: number
    messagesDelivered: number
    messagesRead: number
    messagesFailed: number
    deliveryRate: number
    readRate: number
    clickRate?: number
    recentCampaigns: Array<{
      id: string
      name: string
      status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed'
      recipients: number
      delivered: number
      read: number
      failed: number
      createdAt: string
    }>
  }
}

export function CampaignStats({ stats }: CampaignStatsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500'
      case 'scheduled':
        return 'bg-blue-500'
      case 'running':
        return 'bg-yellow-500'
      case 'completed':
        return 'bg-green-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'scheduled':
        return 'Agendada'
      case 'running':
        return 'Executando'
      case 'completed':
        return 'Concluída'
      case 'failed':
        return 'Falhou'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Campanhas
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Destinatários Alcançados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRecipients.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.messagesDelivered.toLocaleString()} entregues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Entrega
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.deliveryRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.deliveryRate >= 95 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  Excelente
                </>
              ) : stats.deliveryRate >= 85 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-yellow-500" />
                  Boa
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  Precisa melhorar
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Leitura
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.readRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {stats.readRate >= 70 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  Excelente
                </>
              ) : stats.readRate >= 50 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-yellow-500" />
                  Boa
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  Precisa melhorar
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance das Mensagens</CardTitle>
            <CardDescription>
              Estatísticas detalhadas de entrega e engajamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Entregues
                </span>
                <span>{stats.messagesDelivered.toLocaleString()}</span>
              </div>
              <Progress
                value={(stats.messagesDelivered / stats.totalRecipients) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Lidas
                </span>
                <span>{stats.messagesRead.toLocaleString()}</span>
              </div>
              <Progress
                value={(stats.messagesRead / stats.messagesDelivered) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Falharam
                </span>
                <span>{stats.messagesFailed.toLocaleString()}</span>
              </div>
              <Progress
                value={(stats.messagesFailed / stats.totalRecipients) * 100}
                className="h-2"
              />
            </div>

            {stats.clickRate && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-purple-500" />
                    Taxa de Cliques
                  </span>
                  <span>{stats.clickRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.clickRate} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Campanhas Recentes</CardTitle>
            <CardDescription>
              Últimas campanhas criadas e seus status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{campaign?.name || 'Campanha'}</h4>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(campaign.status)} text-white`}
                      >
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.recipients} destinatários • {campaign.delivered}{' '}
                      entregues • {campaign.read} lidas
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {(
                        (campaign.delivered / campaign.recipients) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                    <div className="text-xs text-muted-foreground">entrega</div>
                  </div>
                </div>
              ))}

              {stats.recentCampaigns.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>Nenhuma campanha encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
