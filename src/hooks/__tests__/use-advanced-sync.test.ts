import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAdvancedSync } from '../use-advanced-sync'

// Mock Z-API instances hook
vi.mock('@/lib/z-api/client', () => ({
  useZApiInstances: vi.fn(() => ({
    getActiveInstance: vi.fn(() => ({
      instance_id: 'test-instance',
      instance_token: 'test-token',
      client_token: 'test-client-token',
    })),
  })),
}))

// Mock SyncService
vi.mock('@/lib/sync/sync-service', () => ({
  SyncService: vi.fn().mockImplementation(() => ({
    syncGroupsFromWhatsApp: vi.fn(),
    syncGroupsToWhatsApp: vi.fn(),
    syncCommunitiesFromWhatsApp: vi.fn(),
    syncCommunitiesToWhatsApp: vi.fn(),
    syncGroupParticipants: vi.fn(),
    syncGroupAdmins: vi.fn(),
  })),
}))

// Mock Z-API Client
vi.mock('@/lib/z-api/client', () => ({
  ZApiClient: vi.fn().mockImplementation(() => ({
    getGroups: vi.fn(),
    getCommunities: vi.fn(),
  })),
}))

describe('useAdvancedSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAdvancedSync())

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toBe(null)
  })

  it('should sync groups from WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'group-1', name: 'Test Group' }],
        stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupsFromWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: [{ id: 'group-1', name: 'Test Group' }],
      stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should sync groups to WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsToWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'group-1', name: 'Test Group' }],
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupsToWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: [{ id: 'group-1', name: 'Test Group' }],
      stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should sync communities from WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'community-1', name: 'Test Community' }],
        stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncCommunitiesFromWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: [{ id: 'community-1', name: 'Test Community' }],
      stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should sync communities to WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncCommunitiesToWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'community-1', name: 'Test Community' }],
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncCommunitiesToWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: [{ id: 'community-1', name: 'Test Community' }],
      stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should sync group participants successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupParticipants: vi.fn().mockResolvedValue({
        success: true,
        data: { groupId: 'group-1', participants: ['5511999999999', '5511888888888'] },
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupParticipants('group-1')
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: { groupId: 'group-1', participants: ['5511999999999', '5511888888888'] },
      stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should sync group admins successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupAdmins: vi.fn().mockResolvedValue({
        success: true,
        data: { groupId: 'group-1', admins: ['5511999999999'] },
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupAdmins('group-1')
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: { groupId: 'group-1', admins: ['5511999999999'] },
      stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should perform complete sync from WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'group-1', name: 'Test Group' }],
        stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
      }),
      syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'community-1', name: 'Test Community' }],
        stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncAllFromWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: {
        groups: [{ id: 'group-1', name: 'Test Group' }],
        communities: [{ id: 'community-1', name: 'Test Community' }],
      },
      stats: { created: 2, updated: 0, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should perform complete sync to WhatsApp successfully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsToWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'group-1', name: 'Test Group' }],
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
      syncCommunitiesToWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'community-1', name: 'Test Community' }],
        stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncAllToWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(result.current.lastSyncResult).toEqual({
      success: true,
      data: {
        groups: [{ id: 'group-1', name: 'Test Group' }],
        communities: [{ id: 'community-1', name: 'Test Community' }],
      },
      stats: { created: 0, updated: 2, deleted: 0, errors: 0 },
    })
    expect(syncResult.success).toBe(true)
  })

  it('should handle sync errors gracefully', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock sync error
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
        success: false,
        error: 'Sync failed',
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupsFromWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe('Sync failed')
    expect(result.current.lastSyncResult).toEqual({
      success: false,
      error: 'Sync failed',
    })
    expect(syncResult.success).toBe(false)
  })

  it('should handle service unavailable error', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // Mock service unavailable
    const { SyncService } = await import('@/lib/sync/sync-service')
    vi.mocked(SyncService).mockImplementation(() => null as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupsFromWhatsApp()
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe('Serviço de sincronização não disponível')
    expect(result.current.lastSyncResult).toEqual({
      success: false,
      error: 'Serviço de sincronização não disponível',
    })
    expect(syncResult.success).toBe(false)
  })

  it('should clear error when clearError is called', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    // First, set an error
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
        success: false,
        error: 'Sync failed',
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    await act(async () => {
      await result.current.syncGroupsFromWhatsApp()
    })

    expect(result.current.syncError).toBe('Sync failed')

    // Then clear the error
    act(() => {
      result.current.clearError()
    })

    expect(result.current.syncError).toBe(null)
  })

  it('should return sync service instance', () => {
    const { result } = renderHook(() => useAdvancedSync())

    const syncService = result.current.getSyncService()
    expect(syncService).toBeDefined()
  })

  it('should handle sync with custom options', async () => {
    const { result } = renderHook(() => useAdvancedSync())

    const customOptions = {
      forceUpdate: true,
      includeParticipants: false,
      includeAdmins: true,
      includeMessages: false,
      batchSize: 25,
    }

    // Mock successful sync
    const { SyncService } = await import('@/lib/sync/sync-service')
    const mockSyncService = {
      syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: 'group-1', name: 'Test Group' }],
        stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
      }),
    }
    vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

    let syncResult
    await act(async () => {
      syncResult = await result.current.syncGroupsFromWhatsApp(customOptions)
    })

    expect(result.current.isSyncing).toBe(false)
    expect(result.current.syncError).toBe(null)
    expect(syncResult.success).toBe(true)
    expect(mockSyncService.syncGroupsFromWhatsApp).toHaveBeenCalledWith(customOptions)
  })
})
