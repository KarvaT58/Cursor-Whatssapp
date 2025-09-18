import { useState, useCallback } from 'react'

export interface GroupFile {
  id: string
  group_id: string
  uploaded_by: string
  uploaded_by_phone: string
  filename: string
  original_filename: string
  content_type: string
  size: number
  description: string | null
  storage_path: string
  status: 'uploading' | 'completed' | 'compressing' | 'failed'
  is_compressed: boolean
  compression_ratio: number | null
  compression_progress: number
  compressed_size: number | null
  compression_settings: any
  upload_progress: number
  download_count: number
  last_downloaded_at: string | null
  created_at: string
  completed_at: string | null
  compressed_at: string | null
  file_downloads?: Array<{
    id: string
    downloaded_by_phone: string
    downloaded_at: string
  }>
}

export interface UseGroupFilesReturn {
  // Operações de upload
  startUpload: (groupId: string, data: StartUploadData) => Promise<any>
  confirmUpload: (groupId: string, fileId: string) => Promise<any>
  
  // Operações de arquivo
  getFiles: (groupId: string, filters: FileFilters) => Promise<any>
  downloadFile: (groupId: string, fileId: string) => Promise<any>
  compressFile: (groupId: string, fileId: string, data: CompressData) => Promise<any>
  getCompressionStatus: (groupId: string, fileId: string) => Promise<any>
  
  // Estado
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export interface StartUploadData {
  filename: string
  content_type: string
  size: number
  description?: string
  is_compressed?: boolean
  compression_ratio?: number
}

export interface FileFilters {
  page?: number
  limit?: number
  search?: string
  type?: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'text'
  sortBy?: 'created_at' | 'filename' | 'size' | 'download_count'
  sortOrder?: 'asc' | 'desc'
}

export interface CompressData {
  compression_level?: number
  target_size?: number
  quality?: number
}

export function useGroupFiles(): UseGroupFilesReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startUpload = useCallback(async (groupId: string, data: StartUploadData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao iniciar upload')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const confirmUpload = useCallback(async (groupId: string, fileId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files/upload/${fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao confirmar upload')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getFiles = useCallback(async (groupId: string, filters: FileFilters = {}): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      if (filters.page) searchParams.append('page', filters.page.toString())
      if (filters.limit) searchParams.append('limit', filters.limit.toString())
      if (filters.search) searchParams.append('search', filters.search)
      if (filters.type) searchParams.append('type', filters.type)
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy)
      if (filters.sortOrder) searchParams.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/groups/${groupId}/files?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar arquivos')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const downloadFile = useCallback(async (groupId: string, fileId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files/${fileId}/download`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao baixar arquivo')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const compressFile = useCallback(async (groupId: string, fileId: string, data: CompressData): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files/${fileId}/compress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao comprimir arquivo')
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getCompressionStatus = useCallback(async (groupId: string, fileId: string): Promise<any> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/groups/${groupId}/files/${fileId}/compress`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao obter status da compressão')
      }

      const result = await response.json()
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
    startUpload,
    confirmUpload,
    getFiles,
    downloadFile,
    compressFile,
    getCompressionStatus,
    isLoading,
    error,
    clearError,
  }
}
