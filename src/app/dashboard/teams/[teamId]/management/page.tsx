'use client'

import { useParams } from 'next/navigation'
import { TeamManagement } from '@/components/teams/team-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTeam } from '@/hooks/use-teams'
import { ArrowLeft, Users, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TeamManagementPage() {
  const params = useParams()
  const teamId = params.teamId as string

  const { team, isLoading, error } = useTeam({ teamId })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando equipe...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              Erro ao carregar equipe: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Equipe não encontrada
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/teams">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{team?.team?.name || 'Equipe'}</h1>
            <p className="text-muted-foreground">{team?.team?.description || 'Sem descrição'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {team.members.length} membro{team.members.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.members.length}</div>
            <p className="text-xs text-muted-foreground">
              {team.members.filter((m) => m.role === 'admin').length}{' '}
              administrador
              {team.members.filter((m) => m.role === 'admin').length !== 1
                ? 'es'
                : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membros Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.members.filter((m) => m.isOnline).length}
            </div>
            <p className="text-xs text-muted-foreground">Ativos agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Criada em
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(team.team.created_at).toLocaleDateString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              {new Date(team.team.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Management */}
      <TeamManagement teamId={teamId} />
    </div>
  )
}
