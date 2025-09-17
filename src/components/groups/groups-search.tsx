'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, Filter, X, Users, Calendar, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGroupsSearch, GroupSearchFilters, GroupSearchResult } from '@/hooks/use-groups-search'
import { GroupList } from './group-list'

interface GroupsSearchProps {
  onGroupSelect?: (group: any) => void
  onGroupEdit?: (group: any) => void
  onGroupDelete?: (group: any) => void
}

export function GroupsSearch({ onGroupSelect, onGroupEdit, onGroupDelete }: GroupsSearchProps) {
  const { searchGroups, isLoading, error, clearError } = useGroupsSearch()
  
  // Estados para busca
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<GroupSearchFilters>({})
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  
  // Estados para resultados
  const [searchResult, setSearchResult] = useState<GroupSearchResult | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Executar busca
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setSearchResult(null)
      return
    }

    try {
      const result = await searchGroups({
        query: query.trim(),
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      })
      setSearchResult(result)
    } catch (err) {
      console.error('Erro na busca:', err)
    }
  }, [query, filters, page, limit, sortBy, sortOrder, searchGroups])

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({})
    setQuery('')
    setSearchResult(null)
    setPage(1)
  }, [])

  // Aplicar filtro específico
  const applyFilter = useCallback((key: keyof GroupSearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
    setPage(1)
  }, [])

  // Remover filtro específico
  const removeFilter = useCallback((key: keyof GroupSearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
    setPage(1)
  }, [])

  // Navegar páginas
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  // Filtros ativos para exibição
  const activeFilters = useMemo(() => {
    const active: Array<{ key: string; label: string; value: string }> = []
    
    if (filters.name) {
      active.push({ key: 'name', label: 'Nome', value: filters.name })
    }
    if (filters.description) {
      active.push({ key: 'description', label: 'Descrição', value: filters.description })
    }
    if (filters.participants && filters.participants.length > 0) {
      active.push({ key: 'participants', label: 'Participantes', value: filters.participants.join(', ') })
    }
    
    return active
  }, [filters])

  return (
    <div className="space-y-4">
      {/* Cabeçalho da busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Grupos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de busca principal */}
          <div className="flex gap-2">
            <Input
              placeholder="Digite o nome ou descrição do grupo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome específico</label>
                <Input
                  placeholder="Filtrar por nome exato"
                  value={filters.name || ''}
                  onChange={(e) => applyFilter('name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Descrição</label>
                <Input
                  placeholder="Filtrar por descrição"
                  value={filters.description || ''}
                  onChange={(e) => applyFilter('description', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Participantes</label>
                <Input
                  placeholder="Telefones separados por vírgula"
                  value={filters.participants?.join(', ') || ''}
                  onChange={(e) => applyFilter('participants', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
            </div>
          )}

          {/* Filtros ativos */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                  {filter.label}: {filter.value}
                  <button
                    onClick={() => removeFilter(filter.key as keyof GroupSearchFilters)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Limpar todos
              </Button>
            </div>
          )}

          {/* Ordenação */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar por:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="created_at">Data de criação</SelectItem>
                <SelectItem value="updated_at">Última atualização</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-destructive">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da busca</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {searchResult.pagination.total} grupos encontrados
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GroupList
              groups={searchResult.groups}
              onGroupSelect={onGroupSelect}
              onGroupEdit={onGroupEdit}
              onGroupDelete={onGroupDelete}
            />

            {/* Paginação */}
            {searchResult.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Página {searchResult.pagination.page} de {searchResult.pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page - 1)}
                    disabled={!searchResult.pagination.hasPreviousPage}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(page + 1)}
                    disabled={!searchResult.pagination.hasNextPage}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!searchResult && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Digite um termo de busca para encontrar grupos</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
