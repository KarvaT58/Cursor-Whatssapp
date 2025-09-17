import { useState, useCallback } from 'react'

export interface GroupSearchFilters {
  name?: string
  participants?: string[]
  description?: string
}

export interface GroupSearchParams {
  query: string
  filters?: GroupSearchFilters
  page?: number
  limit?: number
  sortBy?: 'name' | 'created_at' | 'updated_at'
  sortOrder?: 'asc' | 'desc'
}

export interface GroupSearchResult {
  groups: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    query: string
    appliedFilters?: GroupSearchFilters
  }
  sort: {
    by: string
    order: string
  }
}

export interface UseGroupsSearchReturn {
  searchGroups: (params: GroupSearchParams) => Promise<GroupSearchResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupsSearch(): UseGroupsSearchReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchGroups = useCallback(async (params: GroupSearchParams): Promise<GroupSearchResult> => {
    try {
      setIsLoading(true)
      setError(null)

      // Construir URL com parâmetros
      const searchParams = new URLSearchParams()
      
      // Parâmetro obrigatório
      searchParams.set('query', params.query)
      
      // Filtros opcionais
      if (params.filters?.name) {
        searchParams.set('name', params.filters.name)
      }
      if (params.filters?.participants && params.filters.participants.length > 0) {
        searchParams.set('participants', params.filters.participants.join(','))
      }
      if (params.filters?.description) {
        searchParams.set('description', params.filters.description)
      }
      
      // Paginação
      if (params.page) {
        searchParams.set('page', params.page.toString())
      }
      if (params.limit) {
        searchParams.set('limit', params.limit.toString())
      }
      
      // Ordenação
      if (params.sortBy) {
        searchParams.set('sortBy', params.sortBy)
      }
      if (params.sortOrder) {
        searchParams.set('sortOrder', params.sortOrder)
      }

      const response = await fetch(`/api/groups/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar grupos')
      }

      const result: GroupSearchResult = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    searchGroups,
    isLoading,
    error,
    clearError,
  }
}
