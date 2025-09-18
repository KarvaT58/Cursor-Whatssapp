import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as syncGroups } from '@/app/api/groups/sync/route'
import { POST as syncGroupDetails } from '@/app/api/groups/[id]/sync/route'
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
    getGroups: vi.fn(),
    getGroupParticipants: vi.fn(),
    getGroupAdmins: vi.fn(),
    createGroup: vi.fn(),
    updateGroupName: vi.fn(),
    updateGroupDescription: vi.fn(),
  })),
}))

// Mock SyncService
vi.mock('@/lib/sync/sync-service', () => ({
  SyncService: vi.fn().mockImplementation(() => ({
    syncGroupsFromWhatsApp: vi.fn(),
    syncGroupsToWhatsApp: vi.fn(),
    syncGroupParticipants: vi.fn(),
    syncGroupAdmins: vi.fn(),
  })),
}))

describe('Groups API Endpoints', () => {
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

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    whatsapp_id: '120363123456789012@g.us',
    description: 'Test description',
    participants: ['5511999999999', '5511888888888'],
    user_id: 'user-123',
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

  describe('POST /api/groups/sync', () => {
    it('should sync groups from WhatsApp successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
        options: {
          forceUpdate: false,
          includeParticipants: true,
          includeAdmins: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockGroup],
          stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroups(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.direction).toBe('from_whatsapp')
      expect(responseData.stats.created).toBe(1)
    })

    it('should sync groups to WhatsApp successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'to_whatsapp',
        options: {
          forceUpdate: false,
          includeParticipants: true,
          includeAdmins: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupsToWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockGroup],
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroups(request)
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
          includeParticipants: true,
          includeAdmins: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock successful bidirectional sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockGroup],
          stats: { created: 1, updated: 0, deleted: 0, errors: 0 },
        }),
        syncGroupsToWhatsApp: vi.fn().mockResolvedValue({
          success: true,
          data: [mockGroup],
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroups(request)
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

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncGroups(request)
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

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncGroups(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Instância Z-API não encontrada')
    })

    it('should handle sync errors gracefully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock sync error
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupsFromWhatsApp: vi.fn().mockResolvedValue({
          success: false,
          error: 'Sync failed',
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroups(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('Sync failed')
    })

    it('should validate request body', async () => {
      const requestBody = {
        // Missing required instanceId
        direction: 'from_whatsapp',
      }

      const request = new NextRequest('http://localhost:3000/api/groups/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await syncGroups(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })
  })

  describe('POST /api/groups/[id]/sync', () => {
    it('should sync group participants successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        syncType: 'participants',
        options: {
          forceUpdate: false,
          includeMetadata: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock group exists
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table) => {
          if (table === 'z_api_instances') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockInstance,
                error: null,
              }),
            }
          }
          if (table === 'whatsapp_groups') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
          }
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupParticipants: vi.fn().mockResolvedValue({
          success: true,
          data: { groupId: 'group-123', participants: ['5511999999999', '5511888888888'] },
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroupDetails(request, { params: { id: 'group-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.groupId).toBe('group-123')
      expect(responseData.data.results).toHaveLength(1)
      expect(responseData.data.results[0].type).toBe('participants')
    })

    it('should sync group admins successfully', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        syncType: 'admins',
        options: {
          forceUpdate: false,
          includeMetadata: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock group exists
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table) => {
          if (table === 'z_api_instances') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockInstance,
                error: null,
              }),
            }
          }
          if (table === 'whatsapp_groups') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
          }
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupAdmins: vi.fn().mockResolvedValue({
          success: true,
          data: { groupId: 'group-123', admins: ['5511999999999'] },
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroupDetails(request, { params: { id: 'group-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.groupId).toBe('group-123')
      expect(responseData.data.results).toHaveLength(1)
      expect(responseData.data.results[0].type).toBe('admins')
    })

    it('should sync both participants and admins', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        syncType: 'both',
        options: {
          forceUpdate: false,
          includeMetadata: true,
        },
      }

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock group exists
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table) => {
          if (table === 'z_api_instances') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockInstance,
                error: null,
              }),
            }
          }
          if (table === 'whatsapp_groups') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockGroup,
                error: null,
              }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
          }
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      // Mock successful sync
      const { SyncService } = await import('@/lib/sync/sync-service')
      const mockSyncService = {
        syncGroupParticipants: vi.fn().mockResolvedValue({
          success: true,
          data: { groupId: 'group-123', participants: ['5511999999999', '5511888888888'] },
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
        syncGroupAdmins: vi.fn().mockResolvedValue({
          success: true,
          data: { groupId: 'group-123', admins: ['5511999999999'] },
          stats: { created: 0, updated: 1, deleted: 0, errors: 0 },
        }),
      }
      vi.mocked(SyncService).mockImplementation(() => mockSyncService as any)

      const response = await syncGroupDetails(request, { params: { id: 'group-123' } })
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.groupId).toBe('group-123')
      expect(responseData.data.results).toHaveLength(2)
      expect(responseData.data.results[0].type).toBe('participants')
      expect(responseData.data.results[1].type).toBe('admins')
    })

    it('should return 404 for non-existent group', async () => {
      const requestBody = {
        instanceId: 'instance-123',
        syncType: 'participants',
      }

      const request = new NextRequest('http://localhost:3000/api/groups/non-existent/sync', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Mock group not found
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn((table) => {
          if (table === 'z_api_instances') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: mockInstance,
                error: null,
              }),
            }
          }
          if (table === 'whatsapp_groups') {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Not found'),
              }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
          }
        }),
      }
      vi.mocked(createClient).mockReturnValue(mockSupabase as any)

      const response = await syncGroupDetails(request, { params: { id: 'non-existent' } })
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Grupo não encontrado')
    })
  })
})
