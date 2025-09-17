'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Users, Bell, Settings, ArrowLeft } from 'lucide-react'
import { TeamChat } from '@/components/teams/team-chat'
import { OnlineMembers } from '@/components/teams/online-members'
import { TeamNotifications } from '@/components/teams/team-notifications'
import { useTeam } from '@/hooks/use-teams'
import { useTeamMembersById } from '@/hooks/use-teams'
import { useTeamPresence } from '@/hooks/use-team-messages'
import { useTeamNotifications } from '@/hooks/use-team-notifications'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function TeamChatPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const [activeTab, setActiveTab] = useState<
    'chat' | 'members' | 'notifications'
  >('chat')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { team, isLoading: teamLoading } = useTeam({ teamId })
  const { members, isLoading: membersLoading } = useTeamMembersById({ teamId })
  const { onlineMembers, isOnline } = useTeamPresence(teamId)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  } = useTeamNotifications({ teamId })

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando chat da equipe...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-2">Equipe não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A equipe que você está procurando não existe ou você não tem acesso.
          </p>
          <Link href="/dashboard/teams">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Equipes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/teams">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>

            <div>
              <h1 className="text-xl font-semibold">{team?.team?.name || 'Equipe'}</h1>
              <p className="text-sm text-muted-foreground">
                Chat interno da equipe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{onlineMembers.size} online</Badge>

            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} não lidas</Badge>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4">
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Button>

          <Button
            variant={activeTab === 'members' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('members')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Membros
            {onlineMembers.size > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {onlineMembers.size}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            sidebarCollapsed ? 'mr-0' : 'mr-80'
          )}
        >
          {activeTab === 'chat' && (
            <TeamChat teamId={teamId} className="h-full" />
          )}

          {activeTab === 'members' && (
            <div className="h-full p-4">
              <OnlineMembers
                members={members?.members || []}
                onlineMembers={onlineMembers}
                isOnline={isOnline}
                className="h-full"
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="h-full p-4">
              <TeamNotifications
                teamId={teamId}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearNotification={clearNotification}
                onClearAllNotifications={clearAllNotifications}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-80 border-l bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Informações da Equipe</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Team Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sobre a Equipe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Nome:</span>
                    <p className="text-sm text-muted-foreground">
                      {team?.team?.name || 'Equipe'}
                    </p>
                  </div>

                  {team?.team.description && (
                    <div>
                      <span className="text-sm font-medium">Descrição:</span>
                      <p className="text-sm text-muted-foreground">
                        {team.team.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium">Membros:</span>
                    <p className="text-sm text-muted-foreground">
                      {members?.members?.length || 0} membros
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Criado em:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(team?.team.created_at || '').toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Online:</span>
                    <Badge variant="secondary">{onlineMembers.size}</Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Total de membros:</span>
                    <Badge variant="outline">
                      {members?.members?.length || 0}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm">Notificações:</span>
                    <Badge
                      variant={unreadCount > 0 ? 'destructive' : 'secondary'}
                    >
                      {unreadCount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações da Equipe
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Membros
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <div className="w-12 border-l bg-muted/30 flex flex-col items-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="mb-4"
            >
              →
            </Button>

            <div className="space-y-2">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
                className="w-8 h-8 p-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button
                variant={activeTab === 'members' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('members')}
                className="w-8 h-8 p-0"
              >
                <Users className="h-4 w-4" />
              </Button>

              <Button
                variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="w-8 h-8 p-0"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
