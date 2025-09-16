'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConnectionStatus } from './connection-status'
import { useRealtimeAll } from '@/hooks/use-realtime-all'
import {
  Activity,
  MessageSquare,
  Contact,
  Users2,
  Settings,
  Bell,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react'

interface RealtimeDashboardProps {
  className?: string
}

export function RealtimeDashboard({ className }: RealtimeDashboardProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const realtime = useRealtimeAll({
    onCampaignUpdate: () => setLastUpdate(new Date()),
    onMessageReceived: () => setLastUpdate(new Date()),
    onContactAdded: () => setLastUpdate(new Date()),
    onGroupUpdated: () => setLastUpdate(new Date()),
    onJobCompleted: () => setLastUpdate(new Date()),
    onNotificationReceived: () => setLastUpdate(new Date()),
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-600" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-600" />
    )
  }

  const getStatusBadge = (isConnected: boolean, count: number) => {
    return (
      <Badge
        variant={isConnected ? 'default' : 'destructive'}
        className="flex items-center gap-1"
      >
        {getStatusIcon(isConnected)}
        {count} canal{count !== 1 ? 'is' : ''}
      </Badge>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Dashboard em Tempo Real
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Status das conexões e canais ativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus showDetails={false} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLastUpdate(new Date())}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Campaigns */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Campanhas</span>
                </div>
                {getStatusBadge(
                  realtime.campaigns.isConnected,
                  realtime.campaigns.channelsCount
                )}
              </div>

              {/* Messages */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Mensagens</span>
                </div>
                {getStatusBadge(
                  realtime.messages.isConnected,
                  realtime.messages.channelsCount
                )}
              </div>

              {/* Contacts */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Contact className="h-4 w-4" />
                  <span className="text-sm font-medium">Contatos</span>
                </div>
                {getStatusBadge(
                  realtime.contacts.isConnected,
                  realtime.contacts.channelsCount
                )}
              </div>

              {/* Groups */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Grupos</span>
                </div>
                {getStatusBadge(
                  realtime.groups.isConnected,
                  realtime.groups.channelsCount
                )}
              </div>

              {/* Queues */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Filas</span>
                </div>
                {getStatusBadge(
                  realtime.queues.isConnected,
                  realtime.queues.channelsCount
                )}
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm font-medium">Notificações</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(
                    realtime.notifications.isConnected,
                    realtime.notifications.channelsCount
                  )}
                  {realtime.notifications.unreadCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      {realtime.notifications.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className="mt-6 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Status Geral</h4>
                  <p className="text-sm text-muted-foreground">
                    {realtime.totalChannels} canal
                    {realtime.totalChannels !== 1 ? 'is' : ''} ativo
                    {realtime.totalChannels !== 1 ? 's' : ''}
                  </p>
                </div>
                <Badge
                  variant={realtime.allConnected ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {getStatusIcon(realtime.allConnected)}
                  {realtime.allConnected
                    ? 'Tudo Conectado'
                    : 'Algumas Conexões Offline'}
                </Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <ConnectionStatus showDetails={true} />

              <div className="grid gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Canais Ativos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Campanhas</span>
                      <Badge variant="outline">
                        {realtime.campaigns.channelsCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mensagens</span>
                      <Badge variant="outline">
                        {realtime.messages.channelsCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contatos</span>
                      <Badge variant="outline">
                        {realtime.contacts.channelsCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Grupos</span>
                      <Badge variant="outline">
                        {realtime.groups.channelsCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Filas</span>
                      <Badge variant="outline">
                        {realtime.queues.channelsCount}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Notificações</span>
                      <Badge variant="outline">
                        {realtime.notifications.channelsCount}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-xs text-muted-foreground text-center">
                  Última atualização: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
