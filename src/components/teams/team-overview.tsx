'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTeams, useTeamMembers } from '@/hooks/use-teams'
import { Users, MessageSquare, Calendar, Activity } from 'lucide-react'

interface TeamOverviewProps {
  className?: string
}

export function TeamOverview({ className }: TeamOverviewProps) {
  const { team, isLoading: teamLoading } = useTeams()
  const { members, isLoading: membersLoading } = useTeamMembers()

  if (teamLoading || membersLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">
            Carregando visão geral da equipe...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!team) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Nenhuma equipe encontrada
          </div>
        </CardContent>
      </Card>
    )
  }

  const memberCount = members?.members.length || 0
  const activeMembers = memberCount // Todos os membros são considerados ativos por enquanto
  const ownerCount = 0 // Não temos proprietários no sistema atual
  const adminCount =
    members?.members.filter((m) => m.role === 'admin').length || 0

  return (
    <div className={className}>
      {/* Team Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{team.team.name}</CardTitle>
              {team.team.description && (
                <p className="text-muted-foreground mt-1">
                  {team.team.description}
                </p>
              )}
            </div>
            <Badge variant="default">Ativa</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Membros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeMembers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proprietários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerCount}</div>
            <p className="text-xs text-muted-foreground">Acesso total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">Gerenciamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criada em</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(team.team.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(team.team.created_at).getFullYear()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Equipe criada em{' '}
                {new Date(team.team.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {team.team.updated_at !== team.team.created_at && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  Última atualização em{' '}
                  {new Date(team.team.updated_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {memberCount > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>
                  {memberCount} membro{memberCount !== 1 ? 's' : ''} na equipe
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
