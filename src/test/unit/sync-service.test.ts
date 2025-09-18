import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SyncService } from '@/lib/sync/sync-service'

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}))

// Mock Z-API Client
vi.mock('@/lib/z-api/client', () => ({
  ZApiClient: vi.fn().mockImplementation(() => ({
    getGroups: vi.fn(),
    getCommunities: vi.fn(),
    getGroupParticipants: vi.fn(),
    getGroupAdmins: vi.fn(),
    createGroup: vi.fn(),
    updateGroupName: vi.fn(),
    updateGroupDescription: vi.fn(),
  })),
}))

describe('SyncService', () => {
  let syncService: SyncService
  let mockZApiClient: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Z-API Client
    mockZApiClient = {
      getGroups: vi.fn(),
      getCommunities: vi.fn(),
      getGroupParticipants: vi.fn(),
      getGroupAdmins: vi.fn(),
      createGroup: vi.fn(),
      updateGroupName: vi.fn(),
      updateGroupDescription: vi.fn(),
    }

    // Create SyncService instance
    syncService = new SyncService(mockZApiClient)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('syncGroupsFromWhatsApp', () => {
    it('should handle Z-API errors', async () => {
      // Mock Z-API error
      mockZApiClient.getGroups.mockResolvedValue({
        success: false,
        error: 'Z-API connection failed',
      })

      const result = await syncService.syncGroupsFromWhatsApp()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Z-API connection failed')
    })
  })

  describe('syncCommunitiesFromWhatsApp', () => {
    it('should handle Z-API errors for communities', async () => {
      // Mock Z-API error
      mockZApiClient.getCommunities.mockResolvedValue({
        success: false,
        error: 'Z-API connection failed',
      })

      const result = await syncService.syncCommunitiesFromWhatsApp()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Z-API connection failed')
    })
  })

  describe('syncGroupParticipants', () => {
    it('should handle Z-API errors for participants', async () => {
      const groupId = 'group-123'

      // Mock Z-API error
      mockZApiClient.getGroupParticipants.mockResolvedValue({
        success: false,
        error: 'Failed to get participants',
      })

      const result = await syncService.syncGroupParticipants(groupId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to get participants')
    })
  })

  describe('syncGroupAdmins', () => {
    it('should handle Z-API errors for admins', async () => {
      const groupId = 'group-123'

      // Mock Z-API error
      mockZApiClient.getGroupAdmins.mockResolvedValue({
        success: false,
        error: 'Failed to get admins',
      })

      const result = await syncService.syncGroupAdmins(groupId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to get admins')
    })
  })
})