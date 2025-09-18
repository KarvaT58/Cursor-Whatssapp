import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as syncCommunities } from '@/app/api/communities/sync/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
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
    getCommunities: vi.fn(),
    createCommunity: vi.fn(),
    updateCommunityName: vi.fn(),
    updateCommunityDescription: vi.fn(),
    getCommunityGroups: vi.fn(),
    addGroupToCommunity: vi.fn(),
    removeGroupFromCommunity: vi.fn(),
  })),
}))

// Mock SyncService
vi.mock('@/lib/sync/sync-service', () => ({
  SyncService: vi.fn().mockImplementation(() => ({
    syncCommunitiesFromWhatsApp: vi.fn(),
    syncCommunitiesToWhatsApp: vi.fn(),
  })),
}))

describe('Communities API Endpoints', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockInstance = {
    id: 'instance-123',
    instance_id: 'z-api-instance',
    instance_token: 'token-123',
    client_token: 'client-123',
    user_id: 'user-123',
  }

  const mockCommunity = {
    id: 'community-123',
    name: 'Test Community',
    whatsapp_community_id: '120363123456789012@g.us',
    description: 'Test community description',
    image_url: 'https://example.com/image.jpg',
    announcement_group_id: '120363123456789013@g.us',
    created_by: 'user-123',
    user_id: 'user-123',
    is_active: true,
    settings: {
      allow_member_invites: true,
      require_admin_approval: false,
      max_groups: 10,
      allow_announcements: true,
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful authentication
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockInstance,
          error: null,
        }),
      })),
    }

    vi.mocked(createClient).mockReturnValue(mockSupabase as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/communities/sync', () => {
    it('should sync communities from WhatsApp successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
        options: {
          forceUpdate: false,
          includeGroups: true,
          includeMembers: true,
          includeAnnouncements: false,
          batchSize: 50,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.direction).toBe('from_whatsapp')
      expect(responseData.stats.created).toBe(1)
    })

    it('should sync communities to WhatsApp successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'to_whatsapp',
        options: {
          forceUpdate: false,
          includeGroups: true,
          includeMembers: true,
          includeAnnouncements: false,
          batchSize: 50,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesToWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.direction).toBe('to_whatsapp')
      expect(responseData.stats.updated).toBe(1)
    })

    it('should handle bidirectional sync', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'bidirectional',
        options: {
          forceUpdate: false,
          includeGroups: true,
          includeMembers: true,
          includeAnnouncements: false,
          batchSize: 50,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful bidirectional sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
        }),
        syncCommunitiesToWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.direction).toBe('bidirectional')
      expect(responseData.stats.created).toBe(1)
      expect(responseData.stats.updated).toBe(1)
    })

    it('should return 401 for unauthenticated requests', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.error).toBe('Não autorizado')
    })

    it('should return 404 for non-existent instance', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Not found'),
          }),
        })),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      const requestBody = {
        instanceId: 'non-existent-instance',
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Instância Z-API não encontrada')
    })

    it('should handle sync errors gracefully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock sync error
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
          success: false,
          error: 'Community sync failed',
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Community sync failed')
    })

    it('should validate request body', async () => {
      const requestBody = {
        // Missing required instanceId
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })

    it('should handle invalid direction', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'invalid_direction',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })

    it('should handle sync with custom options', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
        options: {
          forceUpdate: true,
          includeGroups: false,
          includeMembers: true,
          includeAnnouncements: true,
          batchSize: 25,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 0, updated: 1, deleted: 1, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.stats.updated).toBe(1)
      expect(responseData.stats.deleted).toBe(1)
    })

    it('should handle partial sync failures', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'bidirectional',
      }

      const request = new NextRequest('http://localhost:3000/api/communities/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock partial sync failure
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncCommunitiesFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockCommunity],
          stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
        }),
        syncCommunitiesToWhatsApp: vi.fn().mockResolvedValue({
          success: false,
          error: 'Failed to sync to WhatsApp',
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncCommunities(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Failed to sync to WhatsApp')
    })
  })
})
