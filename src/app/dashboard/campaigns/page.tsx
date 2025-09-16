'use client'

import { useState } from 'react'
import { useCampaigns } from '@/hooks/use-campaigns'
import { CampaignMetricsComponent } from '@/components/campaigns/campaign-metrics'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CampaignBuilder } from '@/components/campaigns/campaign-builder'
import { CampaignStats } from '@/components/campaigns/campaign-stats'
import { MessageTemplate } from '@/components/campaigns/message-template'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
} from 'lucide-react'

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  const {
    campaigns,
    loading,
    error,
    metrics,
    startCampaign,
    pauseCampaign,
    stopCampaign,
    deleteCampaign,
  } = useCampaigns()

  // Mock stats data - in real app this would come from API
  const mockStats = {
    totalCampaigns: campaigns?.length || 0,
    activeCampaigns:
      campaigns?.filter((c) => c.status === 'running').length || 0,
    completedCampaigns:
      campaigns?.filter((c) => c.status === 'completed').length || 0,
    totalRecipients: 2847,
    messagesDelivered: 2683,
    messagesRead: 2096,
    messagesFailed: 164,
    deliveryRate: 94.2,
    readRate: 78.1,
    clickRate: 12.4,
    recentCampaigns:
      campaigns?.slice(0, 5).map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        recipients: campaign.recipients?.length || 0,
        delivered: Math.floor((campaign.recipients?.length || 0) * 0.94),
        read: Math.floor((campaign.recipients?.length || 0) * 0.78),
        failed: Math.floor((campaign.recipients?.length || 0) * 0.06),
        createdAt: campaign.created_at || '',
      })) || [],
  }

  const handleSaveCampaign = (campaignData: {
    name: string
    message: string
    recipients: string[]
    scheduledAt?: Date
    isScheduled: boolean
  }) => {
    console.log('Saving campaign:', campaignData)
    // TODO: Implement save campaign logic
    setIsBuilderOpen(false)
  }

  const handleSendCampaign = (campaignData: {
    name: string
    message: string
    recipients: string[]
    scheduledAt?: Date
    isScheduled: boolean
  }) => {
    console.log('Sending campaign:', campaignData)
    // TODO: Implement send campaign logic
    setIsBuilderOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie suas campanhas de marketing em massa
          </p>
        </div>
        <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
              <DialogDescription>
                Crie uma nova campanha de marketing em massa
              </DialogDescription>
            </DialogHeader>
            <CampaignBuilder
              onSave={handleSaveCampaign}
              onSend={handleSendCampaign}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="builder">Criar Campanha</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Campanhas
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2 esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mensagens Enviadas
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.totalRecipients.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +180 hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Entrega
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.deliveryRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +1.2% vs. mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Campanhas Ativas
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockStats.activeCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  2 agendadas para amanhã
                </p>
              </CardContent>
            </Card>
          </div>

          <CampaignStats stats={mockStats} />
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Lista de Campanhas
              </CardTitle>
              <CardDescription>
                Gerencie e monitore suas campanhas de mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignList
                campaigns={campaigns}
                loading={loading}
                onStartCampaign={startCampaign}
                onPauseCampaign={pauseCampaign}
                onStopCampaign={stopCampaign}
                onDeleteCampaign={deleteCampaign}
                onEditCampaign={(id) => console.log('Edit campaign:', id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Campanha</CardTitle>
              <CardDescription>
                Use o construtor de campanhas para criar mensagens
                personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignBuilder
                onSave={handleSaveCampaign}
                onSend={handleSendCampaign}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplate
            onSave={(template) => console.log('Save template:', template)}
            onEdit={(template) => console.log('Edit template:', template)}
            onDelete={(templateId) =>
              console.log('Delete template:', templateId)
            }
            onSelect={(template) => console.log('Select template:', template)}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <CampaignMetricsComponent metrics={metrics} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
