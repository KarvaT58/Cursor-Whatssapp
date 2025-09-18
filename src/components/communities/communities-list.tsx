'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Users, MessageSquare, Settings, MoreVertical, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCommunities } from '@/hooks/use-communities'
import { WhatsAppCommunity } from '@/types/communities'

interface CommunitiesListProps {
  onCreateCommunity?: () => void
  onEditCommunity?: (community: WhatsAppCommunity) => void
  onViewCommunity?: (community: WhatsAppCommunity) => void
}

export function CommunitiesList({ 
  onCreateCommunity, 
  onEditCommunity, 
  onViewCommunity 
}: CommunitiesListProps) {
  const { getCommunities, isLoading, error, clearError } = useCommunities()

  // Estados locais
  const [communities, setCommunities] = useState<WhatsAppCommunity[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    is_active: true,
  })

  // Carregar comunidades
  const loadCommunities = useCallback(async () => {
    try {
      const result = await getCommunities({
        query: searchQuery || undefined,
        ...filters,
        page: 1,
        pageSize: 20,
      })
      setCommunities(result.communities)
      setPagination(result.pagination)
    } catch (err) {
      console.error('Erro ao carregar comunidades:', err)
    }
  }, [getCommunities, searchQuery, filters])

  // Carregar dados iniciais
  useEffect(() => {
    loadCommunities()
  }, [loadCommunities])

  // Formatar data
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  // Obter inicial do nome
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [])

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunidades WhatsApp</h1>
          <p className="text-muted-foreground">
            Gerencie suas comunidades e grupos de anúncios
          </p>
        </div>
        <Button onClick={onCreateCommunity}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunidade
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" onClick={loadCommunities}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
            <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
              Limpar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de comunidades */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-muted rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : communities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma comunidade encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie sua primeira comunidade para começar'
              }
            </p>
            {!searchQuery && (
              <Button onClick={onCreateCommunity}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Comunidade
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <Card key={community.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.image_url || undefined} />
                    <AvatarFallback>
                      {getInitials(community.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {community.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Criada em {formatDate(community.created_at)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewCommunity?.(community)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditCommunity?.(community)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Descrição */}
                {community.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description}
                  </p>
                )}

                {/* Estatísticas */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{community.stats?.groups_count || 0} grupos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{community.stats?.members_count || 0} membros</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {community.is_active ? (
                    <Badge variant="default">Ativa</Badge>
                  ) : (
                    <Badge variant="secondary">Inativa</Badge>
                  )}
                  
                  {community.announcement_group_id && (
                    <Badge variant="outline">Grupo de Anúncios</Badge>
                  )}
                  
                  {community.settings?.allow_member_invites && (
                    <Badge variant="outline">Convites Permitidos</Badge>
                  )}
                </div>

                {/* Configurações */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Máx. grupos: {community.settings?.max_groups || 10}</p>
                  <p>Aprovação admin: {community.settings?.require_admin_approval ? 'Sim' : 'Não'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage}
            onClick={() => {
              // TODO: Implementar paginação
            }}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => {
              // TODO: Implementar paginação
            }}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
