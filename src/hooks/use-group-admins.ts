import { useState, useCallback } from 'react'

export interface PromoteAdminParams {
  groupId: string
  phone: string
}

export interface DemoteAdminParams {
  groupId: string
  phone: string
}

export interface PromoteAdminResult {
  message: string
  group: any
  promoted_admin: string
  total_admins: number
}

export interface DemoteAdminResult {
  message: string
  group: any
  demoted_admin: string
  total_admins: number
}

export interface UseGroupAdminsReturn {
  promoteAdmin: (params: PromoteAdminParams) => Promise<PromoteAdminResult>
  demoteAdmin: (params: DemoteAdminParams) => Promise<DemoteAdminResult>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupAdmins(): UseGroupAdminsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const promoteAdmin = useCallback(async (params: PromoteAdminParams): Promise<PromoteAdminResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: params.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao promover administrador')
      }

      const result: PromoteAdminResult = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const demoteAdmin = useCallback(async (params: DemoteAdminParams): Promise<DemoteAdminResult> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/admins`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: params.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover administrador')
      }

      const result: DemoteAdminResult = await response.json()
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
    promoteAdmin,
    demoteAdmin,
    isLoading,
    error,
    clearError,
  }
}
