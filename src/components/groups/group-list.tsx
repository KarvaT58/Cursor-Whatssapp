'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { GroupCard } from './group-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, RefreshCw, Users, Grid3X3, List } from 'lucide-react'

type Group = Database['public']['Tables']['whatsapp_groups']['Row']

interface GroupListProps {
  groups: Group[]
  loading?: boolean
  error?: string | null
  onEdit?: (group: Group) => void
  onDelete?: (groupId: string) => void
  onSync?: (groupId: string) => void
  onSyncAll?: () => void
  onViewMessages?: (groupId: string) => void
  onLeave?: (groupId: string) => void
  onCreateGroup?: () => void
  groupNotifications?: Record<string, number>
  onViewNotifications?: (groupId: string) => void
}

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'created_at' | 'updated_at' | 'participants'
type SortOrder = 'asc' | 'desc'

export function GroupList({
  groups,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onSync,
  onSyncAll,
  onViewMessages,
  onLeave,
  onCreateGroup,
  groupNotifications = {},
  onViewNotifications,
}: GroupListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('updated_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [participantFilter, setParticipantFilter] = useState<string>('all')

  // Filtrar grupos
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description &&
        group.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const participantCount = group.participants?.length || 0
    const matchesParticipantFilter =
      participantFilter === 'all' ||
      (participantFilter === 'empty' && participantCount === 0) ||
      (participantFilter === 'small' &&
        participantCount > 0 &&
        participantCount <= 5) ||
      (participantFilter === 'medium' &&
        participantCount > 5 &&
        participantCount <= 20) ||
      (participantFilter === 'large' && participantCount > 20)

    return matchesSearch && matchesParticipantFilter
  })

  // Ordenar grupos
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'created_at':
        aValue = new Date(a.created_at || '').getTime()
        bValue = new Date(b.created_at || '').getTime()
        break
      case 'updated_at':
        aValue = new Date(a.updated_at || a.created_at || '').getTime()
        bValue = new Date(b.updated_at || b.created_at || '').getTime()
        break
      case 'participants':
        aValue = a.participants?.length || 0
        bValue = b.participants?.length || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">Erro ao carregar grupos</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Grupos WhatsApp</h2>
          <Badge variant="secondary" className="text-sm">
            {sortedGroups.length} grupo{sortedGroups.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSyncAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button onClick={onCreateGroup}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Grupo
          </Button>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={participantFilter}
            onValueChange={setParticipantFilter}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="empty">Vazios</SelectItem>
              <SelectItem value="small">Pequenos (1-5)</SelectItem>
              <SelectItem value="medium">Médios (6-20)</SelectItem>
              <SelectItem value="large">Grandes (20+)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [field, order] = value.split('-') as [SortBy, SortOrder]
              setSortBy(field)
              setSortOrder(order)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="updated_at-desc">Mais Recente</SelectItem>
              <SelectItem value="updated_at-asc">Mais Antigo</SelectItem>
              <SelectItem value="participants-desc">
                Mais Participantes
              </SelectItem>
              <SelectItem value="participants-asc">
                Menos Participantes
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de grupos */}
      {sortedGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo ainda'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro grupo ou sincronize com o WhatsApp'}
            </p>
            {!searchTerm && (
              <div className="flex gap-2 justify-center">
                <Button onClick={onCreateGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Grupo
                </Button>
                <Button variant="outline" onClick={onSyncAll}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          {sortedGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={onEdit}
              onDelete={onDelete}
              onSync={onSync}
              onViewMessages={onViewMessages}
              onLeave={onLeave}
              pendingNotifications={groupNotifications[group.id] || 0}
              onViewNotifications={onViewNotifications}
            />
          ))}
        </div>
      )}
    </div>
  )
}
