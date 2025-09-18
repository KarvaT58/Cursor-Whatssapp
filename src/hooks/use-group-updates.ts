import { useState, useCallback } from 'react'

export interface UpdateGroupNameParams {
  groupId: string
  name: string
}

export interface UpdateGroupDescriptionParams {
  groupId: string
  description?: string
}

export interface UpdateGroupImageParams {
  groupId: string
  image_url?: string
  remove_image?: boolean
}

export interface UpdateGroupImageFileParams {
  groupId: string
  file: File
}

export interface UseGroupUpdatesReturn {
  updateGroupName: (params: UpdateGroupNameParams) => Promise<any>
  updateGroupDescription: (params: UpdateGroupDescriptionParams) => Promise<any>
  updateGroupImageUrl: (params: UpdateGroupImageParams) => Promise<any>
  updateGroupImageFile: (params: UpdateGroupImageFileParams) => Promise<any>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useGroupUpdates(): UseGroupUpdatesReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateGroupName = useCallback(async (params: UpdateGroupNameParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: params.name,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar nome do grupo')
      }

      const result = await response.json()
      return result.group
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateGroupDescription = useCallback(async (params: UpdateGroupDescriptionParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/description`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: params.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar descrição do grupo')
      }

      const result = await response.json()
      return result.group
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateGroupImageUrl = useCallback(async (params: UpdateGroupImageParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${params.groupId}/image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: params.image_url,
          remove_image: params.remove_image,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar imagem do grupo')
      }

      const result = await response.json()
      return result.group
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateGroupImageFile = useCallback(async (params: UpdateGroupImageFileParams): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('image', params.file)

      const response = await fetch(`/api/groups/${params.groupId}/image`, {
        method: 'PATCH',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer upload da imagem')
      }

      const result = await response.json()
      return result.group
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
    updateGroupName,
    updateGroupDescription,
    updateGroupImageUrl,
    updateGroupImageFile,
    isLoading,
    error,
    clearError,
  }
}
