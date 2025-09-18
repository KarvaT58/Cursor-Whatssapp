import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestUser, cleanupTestData } from './setup'

describe('Communities Integration Tests', () => {
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('communities-test-user')
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData()
  })

  describe('Communities CRUD Operations', () => {
    it('should create a new community', async () => {
      const communityData = {
        name: 'TEST Integration Community',
        description: 'Test community for integration testing',
        imageUrl: 'https://example.com/test-image.jpg',
        maxGroups: 10,
        settings: {
          allowMemberInvites: true,
          requireAdminApproval: false,
          maxGroups: 10,
          allowAnnouncements: true,
        },
      }

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(communityData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('TEST Integration Community')
      expect(result.data.maxGroups).toBe(10)
      expect(result.data.settings.allowMemberInvites).toBe(true)
    })

    it('should retrieve all communities', async () => {
      // First create a test community
      const communityData = {
        name: 'TEST List Community',
        description: 'Test community for listing',
        maxGroups: 5,
      }

      await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(communityData),
      })

      // Now retrieve all communities
      const response = await fetch('/api/communities', {
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
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('should retrieve a specific community', async () => {
      // First create a test community
      const communityData = {
        name: 'TEST Specific Community',
        description: 'Test community for specific retrieval',
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

      // Now retrieve the specific community
      const response = await fetch(`/api/communities/${communityId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(communityId)
      expect(result.data.name).toBe('TEST Specific Community')
    })

    it('should update a community', async () => {
      // First create a test community
      const communityData = {
        name: 'TEST Update Community',
        description: 'Test community for updating',
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

      // Now update the community
      const updateData = {
        name: 'TEST Updated Community',
        description: 'Updated description',
        maxGroups: 15,
        settings: {
          allowMemberInvites: false,
          requireAdminApproval: true,
          maxGroups: 15,
          allowAnnouncements: false,
        },
      }

      const response = await fetch(`/api/communities/${communityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('TEST Updated Community')
      expect(result.data.description).toBe('Updated description')
      expect(result.data.maxGroups).toBe(15)
    })

    it('should deactivate a community', async () => {
      // First create a test community
      const communityData = {
        name: 'TEST Deactivate Community',
        description: 'Test community for deactivation',
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

      // Now deactivate the community
      const response = await fetch(`/api/communities/${communityId}/deactivate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Comunidade desativada com sucesso')
    })
  })

  describe('Community Groups Management', () => {
    let testCommunityId: string

    beforeEach(async () => {
      // Create a test community for group management tests
      const communityData = {
        name: 'TEST Groups Community',
        description: 'Test community for group management',
        maxGroups: 10,
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
      testCommunityId = createResult.data.id
    })

    it('should add a group to a community', async () => {
      // First create a group
      const groupData = {
        name: 'TEST Community Group',
        description: 'Test group for community',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      const groupResult = await groupResponse.json()
      const groupId = groupResult.data.id

      // Now add the group to the community
      const response = await fetch(`/api/communities/${testCommunityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId,
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Grupo adicionado à comunidade com sucesso')
    })

    it('should retrieve groups from a community', async () => {
      // First add a group to the community
      const groupData = {
        name: 'TEST Community Group List',
        description: 'Test group for community listing',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      const groupResult = await groupResponse.json()
      const groupId = groupResult.data.id

      await fetch(`/api/communities/${testCommunityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId,
        }),
      })

      // Now retrieve groups from the community
      const response = await fetch(`/api/communities/${testCommunityId}/groups`, {
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
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('should remove a group from a community', async () => {
      // First add a group to the community
      const groupData = {
        name: 'TEST Community Group Remove',
        description: 'Test group for community removal',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      const groupResult = await groupResponse.json()
      const groupId = groupResult.data.id

      await fetch(`/api/communities/${testCommunityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId,
        }),
      })

      // Now remove the group from the community
      const response = await fetch(`/api/communities/${testCommunityId}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Grupo removido da comunidade com sucesso')
    })
  })

  describe('Community Announcements', () => {
    let testCommunityId: string

    beforeEach(async () => {
      // Create a test community for announcement tests
      const communityData = {
        name: 'TEST Announcements Community',
        description: 'Test community for announcements',
        maxGroups: 10,
        settings: {
          allowAnnouncements: true,
        },
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
      testCommunityId = createResult.data.id
    })

    it('should send an announcement to all groups in community', async () => {
      // First add a group to the community
      const groupData = {
        name: 'TEST Announcement Group',
        description: 'Test group for announcements',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      const groupResult = await groupResponse.json()
      const groupId = groupResult.data.id

      await fetch(`/api/communities/${testCommunityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId,
        }),
      })

      // Now send an announcement
      const announcementData = {
        content: 'TEST community announcement',
        type: 'text',
        priority: 'normal',
      }

      const response = await fetch(`/api/communities/${testCommunityId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(announcementData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Anúncio enviado com sucesso')
      expect(result.sent_to_groups).toBeGreaterThan(0)
    })

    it('should retrieve announcement history', async () => {
      // First send an announcement
      const announcementData = {
        content: 'TEST announcement for history',
        type: 'text',
        priority: 'normal',
      }

      await fetch(`/api/communities/${testCommunityId}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(announcementData),
      })

      // Now retrieve announcement history
      const response = await fetch(`/api/communities/${testCommunityId}/announcements`, {
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

  describe('Community Members Management', () => {
    let testCommunityId: string

    beforeEach(async () => {
      // Create a test community for member management tests
      const communityData = {
        name: 'TEST Members Community',
        description: 'Test community for member management',
        maxGroups: 10,
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
      testCommunityId = createResult.data.id
    })

    it('should add a member to a community', async () => {
      const memberData = {
        phone: '+0987654321',
        name: 'Test Community Member',
        role: 'member',
      }

      const response = await fetch(`/api/communities/${testCommunityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(memberData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Membro adicionado à comunidade com sucesso')
    })

    it('should retrieve community members', async () => {
      // First add a member
      const memberData = {
        phone: '+0987654321',
        name: 'Test Community Member',
        role: 'member',
      }

      await fetch(`/api/communities/${testCommunityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(memberData),
      })

      // Now retrieve members
      const response = await fetch(`/api/communities/${testCommunityId}/members`, {
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
      expect(result.data.length).toBeGreaterThan(0)
    })

    it('should update member role', async () => {
      // First add a member
      const memberData = {
        phone: '+0987654321',
        name: 'Test Community Member',
        role: 'member',
      }

      await fetch(`/api/communities/${testCommunityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(memberData),
      })

      // Now update the member role
      const updateData = {
        role: 'admin',
      }

      const response = await fetch(`/api/communities/${testCommunityId}/members/+0987654321`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(updateData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Função do membro atualizada com sucesso')
    })

    it('should remove a member from a community', async () => {
      // First add a member
      const memberData = {
        phone: '+0987654321',
        name: 'Test Community Member',
        role: 'member',
      }

      await fetch(`/api/communities/${testCommunityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(memberData),
      })

      // Now remove the member
      const response = await fetch(`/api/communities/${testCommunityId}/members/+0987654321`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Membro removido da comunidade com sucesso')
    })
  })

  describe('Community Error Handling', () => {
    it('should handle non-existent community', async () => {
      const response = await fetch('/api/communities/non-existent-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)

      const result = await response.json()
      expect(result.error).toBe('Comunidade não encontrada')
    })

    it('should handle invalid community data', async () => {
      const invalidCommunityData = {
        // Missing required fields
        description: 'Invalid community data',
      }

      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(invalidCommunityData),
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBe('Dados inválidos')
    })

    it('should handle unauthorized access', async () => {
      const response = await fetch('/api/communities', {
        method: 'GET',
        headers: {
          // Missing authorization header
        },
      })

      expect(response.status).toBe(401)

      const result = await response.json()
      expect(result.error).toBe('Não autorizado')
    })

    it('should handle community group limit exceeded', async () => {
      // Create a community with maxGroups: 1
      const communityData = {
        name: 'TEST Limit Community',
        description: 'Test community with group limit',
        maxGroups: 1,
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

      // Add first group
      const groupData1 = {
        name: 'TEST Group 1',
        description: 'First test group',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse1 = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData1),
      })

      const groupResult1 = await groupResponse1.json()
      const groupId1 = groupResult1.data.id

      await fetch(`/api/communities/${communityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId1,
        }),
      })

      // Try to add second group (should fail)
      const groupData2 = {
        name: 'TEST Group 2',
        description: 'Second test group',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      const groupResponse2 = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData2),
      })

      const groupResult2 = await groupResponse2.json()
      const groupId2 = groupResult2.data.id

      const response = await fetch(`/api/communities/${communityId}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          group_id: groupId2,
        }),
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBe('Limite de grupos na comunidade excedido')
    })
  })
})
