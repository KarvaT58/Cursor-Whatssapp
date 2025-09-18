'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Grid, List, Users, Calendar, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { useCommunities } from '@/hooks/use-communities'
import { CommunityCard } from './community-card'
import { CommunityForm } from './community-form'

interface CommunityListProps {
  className?: string
}

export function CommunityList({ className }: CommunityListProps) {
  const { getCommunities, isLoading, error, clearError } = useCommunities()
  const { toast } = useToast()

  // Estados locais
  const [communities, setCommunities] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    total_pages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
    viewMode: 'grid' as 'grid' | 'list',
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState<any>(null)

  // Carregar comunidades ao montar o componente
  useEffect(() => {
    loadCommunities()
  }, [filters])

  // Carregar comunidades
  const loadCommunities = async () => {
    try {
      const result = await getCommunities({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      
      setCommunities(result.communities || [])
      setPagination(result.pagination || pagination)
    } catch (err) {
      console.error('Erro ao carregar comunidades:', err)
    }
  }

  // Aplicar filtros
  const applyFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Mudar página
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // Manipular sucesso na criação/edição
  const handleFormSuccess = (community: any) => {
    setShowCreateForm(false)
    setEditingCommunity(null)
    loadCommunities()
  }

  // Manipular cancelamento do formulário
  const handleFormCancel = () => {
    setShowCreateForm(false)
    setEditingCommunity(null)
  }

  // Editar comunidade
  const handleEditCommunity = (community: any) => {
    setEditingCommunity(community)
  }

  // Gerenciar grupos da comunidade
  const handleManageGroups = (community: any) => {
    // TODO: Implementar navegação para página de gerenciamento de grupos
    toast({
      title: 'Em desenvolvimento',
      description: 'Funcionalidade de gerenciamento de grupos será implementada em breve',
    })
  }

  // Ver detalhes da comunidade
  const handleViewDetails = (community: any) => {
    // TODO: Implementar navegação para página de detalhes
    toast({
      title: 'Em desenvolvimento',
      description: 'Página de detalhes da comunidade será implementada em breve',
    })
  }

  // Calcular estatísticas
  const totalCommunities = pagination.total
  const publicCommunities = communities.filter(c => c.is_public).length
  const privateCommunities = communities.filter(c => !c.is_public).length
  const totalGroups = communities.reduce((sum, c) => sum + (c.groups_count || 0), 0)

  return (
    <div className={className}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Comunidades</h1>
          <p className="text-muted-foreground">
            Gerencie suas comunidades e organize seus grupos
          </p>
        </div>
        
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunidade
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalCommunities}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{publicCommunities}</div>
                <div className="text-sm text-muted-foreground">Públicas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{privateCommunities}</div>
                <div className="text-sm text-muted-foreground">Privadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{totalGroups}</div>
                <div className="text-sm text-muted-foreground">Grupos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunidades..."
                  value={filters.search}
                  onChange={(e) => applyFilters({ search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => applyFilters({ sortBy: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="created_at">Data de Criação</option>
                <option value="name">Nome</option>
                <option value="groups_count">Número de Grupos</option>
                <option value="total_members">Número de Membros</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilters({ viewMode: filters.viewMode === 'grid' ? 'list' : 'grid' })}
              >
                {filters.viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {error}
            <Button variant="link" onClick={clearError} className="ml-2 p-0 h-auto">
              Limpar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Formulário de criação/edição */}
      {(showCreateForm || editingCommunity) && (
        <div className="mb-6">
          <CommunityForm
            community={editingCommunity}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Lista de comunidades */}
      {communities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma comunidade</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search 
                ? 'Nenhuma comunidade encontrada com os filtros aplicados.'
                : 'Você ainda não criou nenhuma comunidade.'
              }
            </p>
            {!filters.search && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Comunidade
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          filters.viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onEdit={handleEditCommunity}
              onManageGroups={handleManageGroups}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Página {pagination.page} de {pagination.total_pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.total_pages || isLoading}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
