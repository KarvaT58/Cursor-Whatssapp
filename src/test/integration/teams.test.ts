import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestUser, createTestTeam, cleanupTestData } from './setup'

describe('Teams API Integration Tests', () => {
  let testUserId: string
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('team-test-user')
    testUserId = testUser?.id || 'test-user-team'
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('POST /api/teams', () => {
    it('should create a new team', async () => {
      const teamData = {
        name: 'TEST Integration Team',
        description: 'Test team for integration tests',
      }

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(teamData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(teamData.name)
      expect(result.data.description).toBe(teamData.description)
      expect(result.data.owner_id).toBe(testUserId)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Team without name',
      }

      const response = await fetch('/api/teams', {
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

  describe('GET /api/teams', () => {
    it('should retrieve teams for authenticated user', async () => {
      // Create a test team first
      await createTestTeam(testUserId, 'TEST Team for List')

      const response = await fetch('/api/teams', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)

      // Should include our test team
      const testTeam = result.data.find(
        (t: { name: string }) => t.name === 'TEST Team for List'
      )
      expect(testTeam).toBeDefined()
    })
  })

  describe('GET /api/teams/[teamId]', () => {
    it('should retrieve a specific team', async () => {
      // Create a test team
      const testTeam = await createTestTeam(testUserId, 'TEST Team for Get')

      const response = await fetch(`/api/teams/${testTeam?.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(testTeam?.id)
      expect(result.data.name).toBe('TEST Team for Get')
    })

    it('should return 404 for non-existent team', async () => {
      const response = await fetch('/api/teams/non-existent-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/teams/[teamId]', () => {
    it('should update a team', async () => {
      // Create a test team
      const testTeam = await createTestTeam(testUserId, 'TEST Team for Update')

      const updateData = {
        name: 'TEST Updated Team',
        description: 'Updated test team description',
      }

      const response = await fetch(`/api/teams/${testTeam?.id}`, {
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
      expect(result.data.description).toBe(updateData.description)
    })
  })

  describe('POST /api/teams/[teamId]/invites', () => {
    it('should create a team invite', async () => {
      // Create a test team
      const testTeam = await createTestTeam(testUserId, 'TEST Team for Invite')

      const inviteData = {
        email: 'test_invite@example.com',
        role: 'member',
      }

      const response = await fetch(`/api/teams/${testTeam?.id}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(inviteData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.email).toBe(inviteData.email)
      expect(result.data.role).toBe(inviteData.role)
      expect(result.data.team_id).toBe(testTeam?.id)
    })

    it('should validate email format', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Invalid Invite'
      )

      const invalidData = {
        email: 'invalid-email',
        role: 'member',
      }

      const response = await fetch(`/api/teams/${testTeam?.id}/invites`, {
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

  describe('GET /api/teams/[teamId]/invites', () => {
    it('should retrieve team invites', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Invites List'
      )

      const response = await fetch(`/api/teams/${testTeam?.id}/invites`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('POST /api/teams/[teamId]/messages', () => {
    it('should create a team message', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Messages'
      )

      const messageData = {
        content: 'TEST team message content',
        type: 'text',
      }

      const response = await fetch(`/api/teams/${testTeam?.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.content).toBe(messageData.content)
      expect(result.data.type).toBe(messageData.type)
      expect(result.data.team_id).toBe(testTeam?.id)
      expect(result.data.sender_id).toBe(testUserId)
    })

    it('should validate required fields', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Invalid Message'
      )

      const invalidData = {
        type: 'text',
        // Missing content
      }

      const response = await fetch(`/api/teams/${testTeam?.id}/messages`, {
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

  describe('GET /api/teams/[teamId]/messages', () => {
    it('should retrieve team messages', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Messages List'
      )

      const response = await fetch(`/api/teams/${testTeam?.id}/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should support pagination', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Pagination'
      )

      const response = await fetch(
        `/api/teams/${testTeam?.id}/messages?page=1&limit=10`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
          },
        }
      )

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
    })
  })

  describe('GET /api/teams/[teamId]/activities', () => {
    it('should retrieve team activities', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Activities'
      )

      const response = await fetch(`/api/teams/${testTeam?.id}/activities`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })

  describe('POST /api/teams/members', () => {
    it('should add a member to a team', async () => {
      // Create a test team
      const testTeam = await createTestTeam(
        testUserId,
        'TEST Team for Add Member'
      )

      const memberData = {
        team_id: testTeam?.id,
        user_id: 'test-member-user-id',
        role: 'member',
      }

      const response = await fetch('/api/teams/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(memberData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.team_id).toBe(testTeam?.id)
      expect(result.data.user_id).toBe(memberData.user_id)
      expect(result.data.role).toBe(memberData.role)
    })
  })

  describe('GET /api/teams/members', () => {
    it('should retrieve team members', async () => {
      const response = await fetch('/api/teams/members', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)
    })
  })
})
