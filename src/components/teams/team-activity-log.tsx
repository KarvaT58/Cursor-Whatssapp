'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Activity,
  Search,
  Filter,
  UserPlus,
  UserX,
  MessageSquare,
  Settings,
  Crown,
  Shield,
  User,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TeamActivity {
  id: string
  type:
    | 'message'
    | 'member_joined'
    | 'member_left'
    | 'role_changed'
    | 'team_updated'
    | 'invite_sent'
    | 'invite_accepted'
    | 'invite_cancelled'
  description: string
  userId: string
  userName: string
  userEmail: string
  timestamp: string
  metadata?: Record<string, unknown>
}

interface TeamActivityLogProps {
  teamId: string
  className?: string
}

const activityIcons = {
  message: <MessageSquare className="h-4 w-4" />,
  member_joined: <UserPlus className="h-4 w-4" />,
  member_left: <UserX className="h-4 w-4" />,
  role_changed: <Shield className="h-4 w-4" />,
  team_updated: <Settings className="h-4 w-4" />,
  invite_sent: <UserPlus className="h-4 w-4" />,
  invite_accepted: <UserPlus className="h-4 w-4" />,
  invite_cancelled: <UserX className="h-4 w-4" />,
}

const activityColors = {
  message: 'text-blue-600 bg-blue-50',
  member_joined: 'text-green-600 bg-green-50',
  member_left: 'text-red-600 bg-red-50',
  role_changed: 'text-purple-600 bg-purple-50',
  team_updated: 'text-orange-600 bg-orange-50',
  invite_sent: 'text-blue-600 bg-blue-50',
  invite_accepted: 'text-green-600 bg-green-50',
  invite_cancelled: 'text-red-600 bg-red-50',
}

const activityLabels = {
  message: 'Mensagem',
  member_joined: 'Membro Adicionado',
  member_left: 'Membro Removido',
  role_changed: 'Função Alterada',
  team_updated: 'Equipe Atualizada',
  invite_sent: 'Convite Enviado',
  invite_accepted: 'Convite Aceito',
  invite_cancelled: 'Convite Cancelado',
}

export function TeamActivityLog({ teamId, className }: TeamActivityLogProps) {
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Fetch activities
  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (dateFilter !== 'all') params.append('date', dateFilter)

      const response = await fetch(`/api/teams/${teamId}/activities?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch activities'
      setError(errorMessage)
      console.error('Error fetching activities:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [teamId, searchTerm, typeFilter, dateFilter])

  const getDateFilterOptions = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    return [
      { value: 'all', label: 'Todos os períodos' },
      { value: 'today', label: 'Hoje' },
      { value: 'yesterday', label: 'Ontem' },
      { value: 'week', label: 'Última semana' },
      { value: 'month', label: 'Último mês' },
    ]
  }

  const formatActivityDescription = (activity: TeamActivity) => {
    switch (activity.type) {
      case 'message':
        return `Enviou uma mensagem no chat`
      case 'member_joined':
        return `Foi adicionado à equipe`
      case 'member_left':
        return `Foi removido da equipe`
      case 'role_changed':
        const newRole = activity.metadata?.newRole as string
        const oldRole = activity.metadata?.oldRole as string
        return `Função alterada de ${oldRole} para ${newRole}`
      case 'team_updated':
        return `Atualizou as configurações da equipe`
      case 'invite_sent':
        const inviteEmail = activity.metadata?.email as string
        return `Enviou convite para ${inviteEmail}`
      case 'invite_accepted':
        return `Aceitou o convite para a equipe`
      case 'invite_cancelled':
        return `Cancelou o convite`
      default:
        return activity.description
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <div className="text-muted-foreground">Carregando atividades...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar atividades: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Log de Atividades</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activities.length} atividade{activities.length !== 1 ? 's' : ''}{' '}
              registrada{activities.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchActivities}>
            <Activity className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar atividades..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(activityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getDateFilterOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activities List */}
        <ScrollArea className="h-[400px]">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhuma atividade encontrada</p>
              {searchTerm || typeFilter !== 'all' || dateFilter !== 'all' ? (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm('')
                    setTypeFilter('all')
                    setDateFilter('all')
                  }}
                  className="mt-2"
                >
                  Limpar filtros
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${activityColors[activity.type]}`}
                  >
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={activity.metadata?.avatarUrl as string}
                        />
                        <AvatarFallback className="text-xs">
                          {activity.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">
                        {activity.userName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activityLabels[activity.type]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatActivityDescription(activity)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      {format(
                        new Date(activity.timestamp),
                        'dd/MM/yyyy HH:mm',
                        { locale: ptBR }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
