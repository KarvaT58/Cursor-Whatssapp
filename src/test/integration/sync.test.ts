import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestUser, cleanupTestData } from './setup'

describe('Sync Integration Tests', () => {
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('sync-test-user')
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData()
  })

  describe('Groups Sync from WhatsApp', () => {
    it('should sync groups from WhatsApp to database', async () => {
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de grupos iniciada')
      expect(result.sync_id).toBeDefined()
    })

    it('should retrieve sync status', async () => {
      // First start a sync
      const syncResponse = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      const syncResult = await syncResponse.json()
      const syncId = syncResult.sync_id

      // Now check sync status
      const response = await fetch(`/api/sync/status/${syncId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.sync_id).toBe(syncId)
      expect(result.data.status).toBeDefined()
      expect(['pending', 'running', 'completed', 'failed']).toContain(result.data.status)
    })

    it('should handle sync errors gracefully', async () => {
      // Mock a scenario where Z-API is unavailable
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          force_sync: true,
          mock_error: 'zapi_unavailable',
        }),
      })

      // Should handle gracefully even if Z-API is down
      expect([200, 500, 503]).toContain(response.status)

      if (response.status === 200) {
        const result = await response.json()
        expect(result.success).toBe(true)
        expect(result.message).toBe('Sincronização de grupos iniciada')
      }
    })
  })

  describe('Communities Sync from WhatsApp', () => {
    it('should sync communities from WhatsApp to database', async () => {
      const response = await fetch('/api/sync/communities/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de comunidades iniciada')
      expect(result.sync_id).toBeDefined()
    })

    it('should sync community groups and participants', async () => {
      const response = await fetch('/api/sync/communities/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          include_groups: true,
          include_participants: true,
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de comunidades iniciada')
      expect(result.sync_id).toBeDefined()
    })
  })

  describe('Groups Sync to WhatsApp', () => {
    it('should sync groups from database to WhatsApp', async () => {
      // First create a test group in the database
      const groupData = {
        name: 'TEST Sync Group',
        description: 'Test group for sync to WhatsApp',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const createResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      const createResult = await createResponse.json()
      const groupId = createResult.data.id

      // Now sync to WhatsApp
      const response = await fetch('/api/sync/groups/to-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_ids: [groupId],
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de grupos para WhatsApp iniciada')
      expect(result.sync_id).toBeDefined()
    })

    it('should sync all groups to WhatsApp', async () => {
      const response = await fetch('/api/sync/groups/to-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de grupos para WhatsApp iniciada')
      expect(result.sync_id).toBeDefined()
    })
  })

  describe('Communities Sync to WhatsApp', () => {
    it('should sync communities from database to WhatsApp', async () => {
      // First create a test community in the database
      const communityData = {
        name: 'TEST Sync Community',
        description: 'Test community for sync to WhatsApp',
        maxGroups: 5,
      }

      const createResponse = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(communityData),
      })

      const createResult = await createResponse.json()
      const communityId = createResult.data.id

      // Now sync to WhatsApp
      const response = await fetch('/api/sync/communities/to-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          community_ids: [communityId],
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de comunidades para WhatsApp iniciada')
      expect(result.sync_id).toBeDefined()
    })
  })

  describe('Bidirectional Sync', () => {
    it('should perform bidirectional sync between database and WhatsApp', async () => {
      const response = await fetch('/api/sync/bidirectional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          sync_groups: true,
          sync_communities: true,
          conflict_resolution: 'database_priority',
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização bidirecional iniciada')
      expect(result.sync_id).toBeDefined()
    })

    it('should handle sync conflicts', async () => {
      const response = await fetch('/api/sync/bidirectional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          sync_groups: true,
          sync_communities: true,
          conflict_resolution: 'whatsapp_priority',
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização bidirecional iniciada')
      expect(result.sync_id).toBeDefined()
    })
  })

  describe('Sync History and Logs', () => {
    it('should retrieve sync history', async () => {
      const response = await fetch('/api/sync/history', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should retrieve sync logs for a specific sync', async () => {
      // First start a sync
      const syncResponse = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      const syncResult = await syncResponse.json()
      const syncId = syncResult.sync_id

      // Now retrieve logs
      const response = await fetch(`/api/sync/logs/${syncId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should filter sync history by type', async () => {
      const response = await fetch('/api/sync/history?type=groups&status=completed', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('Sync Configuration', () => {
    it('should update sync configuration', async () => {
      const configData = {
        auto_sync_enabled: true,
        sync_interval_minutes: 30,
        max_sync_items: 100,
        conflict_resolution: 'database_priority',
        sync_groups: true,
        sync_communities: true,
        sync_participants: true,
        sync_messages: false,
      }

      const response = await fetch('/api/sync/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(configData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Configuração de sincronização atualizada')
    })

    it('should retrieve current sync configuration', async () => {
      const response = await fetch('/api/sync/config', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.auto_sync_enabled).toBeDefined()
      expect(result.data.sync_interval_minutes).toBeDefined()
    })
  })

  describe('Sync Performance Tests', () => {
    it('should handle large batch sync operations', async () => {
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          batch_size: 50,
          max_items: 1000,
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Sincronização de grupos iniciada')
    })

    it('should handle concurrent sync operations', async () => {
      // Start multiple sync operations concurrently
      const promises = [
        fetch('/api/sync/groups/from-whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
          },
        }),
        fetch('/api/sync/communities/from-whatsapp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
          },
        }),
      ]

      const responses = await Promise.all(promises)

      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })

      const results = await Promise.all(
        responses.map((response) => response.json())
      )

      results.forEach((result) => {
        expect(result.success).toBe(true)
        expect(result.sync_id).toBeDefined()
      })
    })
  })

  describe('Sync Error Handling', () => {
    it('should handle sync timeout', async () => {
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          timeout_seconds: 1, // Very short timeout
        }),
      })

      // Should handle timeout gracefully
      expect([200, 408, 500]).toContain(response.status)
    })

    it('should handle invalid sync parameters', async () => {
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          invalid_param: 'invalid_value',
        }),
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBe('Parâmetros de sincronização inválidos')
    })

    it('should handle unauthorized sync access', async () => {
      const response = await fetch('/api/sync/groups/from-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing authorization header
        },
      })

      expect(response.status).toBe(401)

      const result = await response.json()
      expect(result.error).toBe('Não autorizado')
    })
  })
})
