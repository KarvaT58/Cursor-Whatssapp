import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestUser, cleanupTestData } from './setup'

describe('Groups Integration Tests', () => {
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('groups-test-user')
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData()
  })

  describe('Groups CRUD Operations', () => {
    it('should create a new group', async () => {
      const groupData = {
        name: 'TEST Integration Group',
        description: 'Test group for integration testing',
        participants: ['+1234567890', '+0987654321'],
        admins: ['+1234567890'],
        settings: {
          allowMemberInvites: true,
          allowMemberMessages: true,
          allowMemberMedia: true,
          allowMemberPolls: true,
          requireAdminApproval: false,
          muteNotifications: false,
        },
      }

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('TEST Integration Group')
      expect(result.data.participants).toEqual(['+1234567890', '+0987654321'])
      expect(result.data.admins).toEqual(['+1234567890'])
    })

    it('should retrieve all groups', async () => {
      // First create a test group
      const groupData = {
        name: 'TEST List Group',
        description: 'Test group for listing',
        participants: ['+1234567890'],
        admins: ['+1234567890'],
      }

      await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(groupData),
      })

      // Now retrieve all groups
      const response = await fetch('/api/groups', {
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

    it('should retrieve a specific group', async () => {
      // First create a test group
      const groupData = {
        name: 'TEST Specific Group',
        description: 'Test group for specific retrieval',
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

      // Now retrieve the specific group
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(groupId)
      expect(result.data.name).toBe('TEST Specific Group')
    })

    it('should update a group', async () => {
      // First create a test group
      const groupData = {
        name: 'TEST Update Group',
        description: 'Test group for updating',
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

      // Now update the group
      const updateData = {
        name: 'TEST Updated Group',
        description: 'Updated description',
        settings: {
          allowMemberInvites: false,
          allowMemberMessages: true,
          allowMemberMedia: false,
          allowMemberPolls: true,
          requireAdminApproval: true,
          muteNotifications: true,
        },
      }

      const response = await fetch(`/api/groups/${groupId}`, {
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
      expect(result.data.name).toBe('TEST Updated Group')
      expect(result.data.description).toBe('Updated description')
    })

    it('should delete a group', async () => {
      // First create a test group
      const groupData = {
        name: 'TEST Delete Group',
        description: 'Test group for deletion',
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

      // Now delete the group
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Grupo excluído com sucesso')
    })
  })

  describe('Group Messages Integration', () => {
    let testGroupId: string

    beforeEach(async () => {
      // Create a test group for message tests
      const groupData = {
        name: 'TEST Message Group',
        description: 'Test group for messages',
        participants: ['+1234567890', '+0987654321'],
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
      testGroupId = createResult.data.id
    })

    it('should send a message to a group', async () => {
      const messageData = {
        content: 'TEST integration message',
        type: 'text',
        mentions: ['+0987654321'],
      }

      const response = await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.message).toBe('Mensagem enviada com sucesso')
      expect(result.message_data).toBeDefined()
      expect(result.message_data.content).toBe('TEST integration message')
    })

    it('should retrieve messages from a group', async () => {
      // First send a message
      const messageData = {
        content: 'TEST message for retrieval',
        type: 'text',
      }

      await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      // Now retrieve messages
      const response = await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.messages).toBeDefined()
      expect(Array.isArray(result.messages)).toBe(true)
      expect(result.pagination).toBeDefined()
    })

    it('should delete a message from a group', async () => {
      // First send a message
      const messageData = {
        content: 'TEST message for deletion',
        type: 'text',
      }

      const sendResponse = await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      const sendResult = await sendResponse.json()
      const messageId = sendResult.message_data.id

      // Now delete the message
      const response = await fetch(`/api/groups/${testGroupId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify({
          reason: 'Test deletion',
          notify_author: false,
        }),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.message).toBe('Mensagem apagada com sucesso')
    })
  })

  describe('Group Moderation Integration', () => {
    let testGroupId: string

    beforeEach(async () => {
      // Create a test group for moderation tests
      const groupData = {
        name: 'TEST Moderation Group',
        description: 'Test group for moderation',
        participants: ['+1234567890', '+0987654321'],
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
      testGroupId = createResult.data.id
    })

    it('should create a report for a message', async () => {
      // First send a message
      const messageData = {
        content: 'TEST message for reporting',
        type: 'text',
      }

      const sendResponse = await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      const sendResult = await sendResponse.json()
      const messageId = sendResult.message_data.id

      // Now create a report
      const reportData = {
        message_id: messageId,
        reason: 'spam',
        description: 'This is a test report',
      }

      const response = await fetch(`/api/groups/${testGroupId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(reportData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.message).toBe('Denúncia criada com sucesso')
      expect(result.report).toBeDefined()
    })

    it('should process a report', async () => {
      // First send a message
      const messageData = {
        content: 'TEST message for report processing',
        type: 'text',
      }

      const sendResponse = await fetch(`/api/groups/${testGroupId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(messageData),
      })

      const sendResult = await sendResponse.json()
      const messageId = sendResult.message_data.id

      // Create a report
      const reportData = {
        message_id: messageId,
        reason: 'spam',
        description: 'This is a test report',
      }

      const reportResponse = await fetch(`/api/groups/${testGroupId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(reportData),
      })

      const reportResult = await reportResponse.json()
      const reportId = reportResult.report.id

      // Now process the report
      const processData = {
        action: 'approve',
        moderator_notes: 'Approved after review',
        auto_delete_message: true,
      }

      const response = await fetch(`/api/groups/${testGroupId}/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(processData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.message).toBe('Denúncia aprovada com sucesso')
      expect(result.report).toBeDefined()
    })
  })

  describe('Group Participants Management', () => {
    let testGroupId: string

    beforeEach(async () => {
      // Create a test group for participant tests
      const groupData = {
        name: 'TEST Participants Group',
        description: 'Test group for participants',
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
      testGroupId = createResult.data.id
    })

    it('should add a participant to a group', async () => {
      const participantData = {
        phone: '+0987654321',
        name: 'Test Participant',
      }

      const response = await fetch(`/api/groups/${testGroupId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(participantData),
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Participante adicionado com sucesso')
    })

    it('should remove a participant from a group', async () => {
      // First add a participant
      const participantData = {
        phone: '+0987654321',
        name: 'Test Participant',
      }

      await fetch(`/api/groups/${testGroupId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(participantData),
      })

      // Now remove the participant
      const response = await fetch(`/api/groups/${testGroupId}/participants/+0987654321`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Participante removido com sucesso')
    })

    it('should promote a participant to admin', async () => {
      // First add a participant
      const participantData = {
        phone: '+0987654321',
        name: 'Test Participant',
      }

      await fetch(`/api/groups/${testGroupId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(participantData),
      })

      // Now promote to admin
      const response = await fetch(`/api/groups/${testGroupId}/participants/+0987654321/promote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.message).toBe('Participante promovido a administrador')
    })
  })

  describe('Group Error Handling', () => {
    it('should handle non-existent group', async () => {
      const response = await fetch('/api/groups/non-existent-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)

      const result = await response.json()
      expect(result.error).toBe('Grupo não encontrado')
    })

    it('should handle invalid group data', async () => {
      const invalidGroupData = {
        // Missing required fields
        description: 'Invalid group data',
      }

      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(invalidGroupData),
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBe('Dados inválidos')
    })

    it('should handle unauthorized access', async () => {
      const response = await fetch('/api/groups', {
        method: 'GET',
        headers: {
          // Missing authorization header
        },
      })

      expect(response.status).toBe(401)

      const result = await response.json()
      expect(result.error).toBe('Não autorizado')
    })
  })
})
