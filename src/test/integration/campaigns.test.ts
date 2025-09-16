import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestUser, createTestCampaign, cleanupTestData } from './setup'

describe('Campaigns API Integration Tests', () => {
  let testUserId: string
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('campaign-test-user')
    testUserId = testUser?.id || 'test-user-campaign'
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const campaignData = {
        name: 'TEST Integration Campaign',
        message: 'TEST message for integration test',
        status: 'draft' as const,
        total_recipients: 100,
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(campaignData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(campaignData.name)
      expect(result.data.message).toBe(campaignData.message)
      expect(result.data.status).toBe(campaignData.status)
      expect(result.data.user_id).toBe(testUserId)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        message: 'TEST message without name',
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(invalidData),
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBeDefined()
    })
  })

  describe('GET /api/campaigns', () => {
    it('should retrieve campaigns for authenticated user', async () => {
      // Create a test campaign first
      await createTestCampaign(testUserId, 'TEST Campaign for List')

      const response = await fetch('/api/campaigns', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)

      // Should include our test campaign
      const testCampaign = result.data.find(
        (c: { name: string }) => c.name === 'TEST Campaign for List'
      )
      expect(testCampaign).toBeDefined()
    })

    it('should filter campaigns by status', async () => {
      const response = await fetch('/api/campaigns?status=draft', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)

      // All returned campaigns should have draft status
      result.data.forEach((campaign: { status: string }) => {
        expect(campaign.status).toBe('draft')
      })
    })
  })

  describe('GET /api/campaigns/[id]', () => {
    it('should retrieve a specific campaign', async () => {
      // Create a test campaign
      const testCampaign = await createTestCampaign(
        testUserId,
        'TEST Campaign for Get'
      )

      const response = await fetch(`/api/campaigns/${testCampaign?.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(testCampaign?.id)
      expect(result.data.name).toBe('TEST Campaign for Get')
    })

    it('should return 404 for non-existent campaign', async () => {
      const response = await fetch('/api/campaigns/non-existent-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/campaigns/[id]', () => {
    it('should update a campaign', async () => {
      // Create a test campaign
      const testCampaign = await createTestCampaign(
        testUserId,
        'TEST Campaign for Update'
      )

      const updateData = {
        name: 'TEST Updated Campaign',
        message: 'TEST updated message',
        status: 'active' as const,
      }

      const response = await fetch(`/api/campaigns/${testCampaign?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(updateData.name)
      expect(result.data.message).toBe(updateData.message)
      expect(result.data.status).toBe(updateData.status)
    })
  })

  describe('POST /api/campaigns/[id]/start', () => {
    it('should start a campaign', async () => {
      // Create a test campaign
      const testCampaign = await createTestCampaign(
        testUserId,
        'TEST Campaign for Start'
      )

      const response = await fetch(`/api/campaigns/${testCampaign?.id}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.status).toBe('active')
    })
  })

  describe('POST /api/campaigns/[id]/pause', () => {
    it('should pause a campaign', async () => {
      // Create and start a test campaign
      const testCampaign = await createTestCampaign(
        testUserId,
        'TEST Campaign for Pause'
      )

      // Start the campaign first
      await fetch(`/api/campaigns/${testCampaign?.id}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      const response = await fetch(`/api/campaigns/${testCampaign?.id}/pause`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.status).toBe('paused')
    })
  })

  describe('POST /api/campaigns/[id]/stop', () => {
    it('should stop a campaign', async () => {
      // Create and start a test campaign
      const testCampaign = await createTestCampaign(
        testUserId,
        'TEST Campaign for Stop'
      )

      // Start the campaign first
      await fetch(`/api/campaigns/${testCampaign?.id}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      const response = await fetch(`/api/campaigns/${testCampaign?.id}/stop`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.status).toBe('stopped')
    })
  })

  describe('GET /api/campaigns/metrics', () => {
    it('should retrieve campaign metrics', async () => {
      const response = await fetch('/api/campaigns/metrics', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.total_campaigns).toBeDefined()
      expect(result.data.active_campaigns).toBeDefined()
      expect(result.data.total_sent).toBeDefined()
      expect(result.data.total_delivered).toBeDefined()
    })
  })
})
