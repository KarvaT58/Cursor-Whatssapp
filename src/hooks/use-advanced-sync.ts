'use client'

import { useState, useCallback, useMemo } from 'react'
import { SyncService, SyncResult, SyncOptions } from '@/lib/sync/sync-service'
import { ZApiClient } from '@/lib/z-api/client'
import { useZApiInstances } from '@/lib/z-api/client'

export interface UseAdvancedSyncReturn {
  // Estados
  isSyncing: boolean
  syncError: string | null
  lastSyncResult: SyncResult | null
  
  // Métodos de sincronização de grupos
  syncGroupsFromWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  syncGroupsToWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  syncGroupParticipants: (groupId: string, options?: SyncOptions) => Promise<SyncResult>
  syncGroupAdmins: (groupId: string, options?: SyncOptions) => Promise<SyncResult>
  
  // Métodos de sincronização de comunidades
  syncCommunitiesFromWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  syncCommunitiesToWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  
  // Métodos de sincronização completa
  syncAllFromWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  syncAllToWhatsApp: (options?: SyncOptions) => Promise<SyncResult>
  
  // Utilitários
  clearError: () => void
  getSyncService: () => SyncService | null
}

export function useAdvancedSync(): UseAdvancedSyncReturn {
  const { getActiveInstance } = useZApiInstances()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  // Criar instância do serviço de sincronização
  const syncService = useMemo(() => {
    try {
      // Nota: Em uma implementação real, você precisaria aguardar a instância ativa
      // Por enquanto, vamos criar um cliente mock
      const mockClient = new ZApiClient('mock-instance', 'mock-token', 'mock-client')
      return new SyncService(mockClient)
    } catch (error) {
      console.error('Erro ao criar serviço de sincronização:', error)
      return null
    }
  }, [])

  // Limpar erro
  const clearError = useCallback(() => {
    setSyncError(null)
  }, [])

  // Obter serviço de sincronização
  const getSyncService = useCallback((): SyncService | null => {
    return syncService
  }, [syncService])

  // Sincronizar grupos do WhatsApp para o banco de dados
  const syncGroupsFromWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncGroupsFromWhatsApp(options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de grupos')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronizar grupos do banco de dados para o WhatsApp
  const syncGroupsToWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncGroupsToWhatsApp(options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de grupos')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronizar participantes de um grupo específico
  const syncGroupParticipants = useCallback(async (groupId: string, options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncGroupParticipants(groupId, options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de participantes')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronizar administradores de um grupo específico
  const syncGroupAdmins = useCallback(async (groupId: string, options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncGroupAdmins(groupId, options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de administradores')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronizar comunidades do WhatsApp para o banco de dados
  const syncCommunitiesFromWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncCommunitiesFromWhatsApp(options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de comunidades')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronizar comunidades do banco de dados para o WhatsApp
  const syncCommunitiesToWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      const result = await syncService.syncCommunitiesToWhatsApp(options)
      setLastSyncResult(result)
      
      if (!result.success) {
        setSyncError(result.error || 'Erro na sincronização de comunidades')
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronização completa do WhatsApp para o banco de dados
  const syncAllFromWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      // Executar sincronizações em paralelo
      const [groupsResult, communitiesResult] = await Promise.all([
        syncService.syncGroupsFromWhatsApp(options),
        syncService.syncCommunitiesFromWhatsApp(options)
      ])

      // Combinar resultados
      const combinedResult: SyncResult = {
        success: groupsResult.success && communitiesResult.success,
        data: {
          groups: groupsResult.data,
          communities: communitiesResult.data
        },
        stats: {
          created: (groupsResult.stats?.created || 0) + (communitiesResult.stats?.created || 0),
          updated: (groupsResult.stats?.updated || 0) + (communitiesResult.stats?.updated || 0),
          deleted: (groupsResult.stats?.deleted || 0) + (communitiesResult.stats?.deleted || 0),
          errors: (groupsResult.stats?.errors || 0) + (communitiesResult.stats?.errors || 0)
        },
        error: !groupsResult.success ? groupsResult.error : !communitiesResult.success ? communitiesResult.error : undefined
      }

      setLastSyncResult(combinedResult)
      
      if (!combinedResult.success) {
        setSyncError(combinedResult.error || 'Erro na sincronização completa')
      }

      return combinedResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  // Sincronização completa do banco de dados para o WhatsApp
  const syncAllToWhatsApp = useCallback(async (options: SyncOptions = {}): Promise<SyncResult> => {
    if (!syncService) {
      const error = 'Serviço de sincronização não disponível'
      setSyncError(error)
      return { success: false, error }
    }

    try {
      setIsSyncing(true)
      clearError()

      // Executar sincronizações em paralelo
      const [groupsResult, communitiesResult] = await Promise.all([
        syncService.syncGroupsToWhatsApp(options),
        syncService.syncCommunitiesToWhatsApp(options)
      ])

      // Combinar resultados
      const combinedResult: SyncResult = {
        success: groupsResult.success && communitiesResult.success,
        data: {
          groups: groupsResult.data,
          communities: communitiesResult.data
        },
        stats: {
          created: (groupsResult.stats?.created || 0) + (communitiesResult.stats?.created || 0),
          updated: (groupsResult.stats?.updated || 0) + (communitiesResult.stats?.updated || 0),
          deleted: (groupsResult.stats?.deleted || 0) + (communitiesResult.stats?.deleted || 0),
          errors: (groupsResult.stats?.errors || 0) + (communitiesResult.stats?.errors || 0)
        },
        error: !groupsResult.success ? groupsResult.error : !communitiesResult.success ? communitiesResult.error : undefined
      }

      setLastSyncResult(combinedResult)
      
      if (!combinedResult.success) {
        setSyncError(combinedResult.error || 'Erro na sincronização completa')
      }

      return combinedResult
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setSyncError(errorMessage)
      const result = { success: false, error: errorMessage }
      setLastSyncResult(result)
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [syncService, clearError])

  return {
    // Estados
    isSyncing,
    syncError,
    lastSyncResult,
    
    // Métodos de sincronização de grupos
    syncGroupsFromWhatsApp,
    syncGroupsToWhatsApp,
    syncGroupParticipants,
    syncGroupAdmins,
    
    // Métodos de sincronização de comunidades
    syncCommunitiesFromWhatsApp,
    syncCommunitiesToWhatsApp,
    
    // Métodos de sincronização completa
    syncAllFromWhatsApp,
    syncAllToWhatsApp,
    
    // Utilitários
    clearError,
    getSyncService,
  }
}
