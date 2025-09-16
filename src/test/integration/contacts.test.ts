import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestUser, createTestContact, cleanupTestData } from './setup'

describe('Contacts API Integration Tests', () => {
  let testUserId: string
  let testUser: { id: string; access_token?: string } | null

  beforeAll(async () => {
    // Create test user
    testUser = await createTestUser('contact-test-user')
    testUserId = testUser?.id || 'test-user-contact'
  })

  afterAll(async () => {
    await cleanupTestData()
  })

  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const contactData = {
        name: 'TEST Integration Contact',
        phone: '+1234567890',
        email: 'test.integration@example.com',
      }

      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: JSON.stringify(contactData),
      })

      expect(response.status).toBe(201)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe(contactData.name)
      expect(result.data.phone).toBe(contactData.phone)
      expect(result.data.email).toBe(contactData.email)
      expect(result.data.user_id).toBe(testUserId)
    })

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing name and phone
      }

      const response = await fetch('/api/contacts', {
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

    it('should validate email format', async () => {
      const invalidData = {
        name: 'TEST Contact',
        phone: '+1234567890',
        email: 'invalid-email',
      }

      const response = await fetch('/api/contacts', {
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

  describe('GET /api/contacts', () => {
    it('should retrieve contacts for authenticated user', async () => {
      // Create a test contact first
      await createTestContact(testUserId, 'TEST Contact for List')

      const response = await fetch('/api/contacts', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)

      // Should include our test contact
      const testContact = result.data.find(
        (c: { name: string }) => c.name === 'TEST Contact for List'
      )
      expect(testContact).toBeDefined()
    })

    it('should support pagination', async () => {
      const response = await fetch('/api/contacts?page=1&limit=10', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.pagination).toBeDefined()
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(10)
    })

    it('should support search', async () => {
      // Create a test contact with specific name
      await createTestContact(testUserId, 'TEST Search Contact')

      const response = await fetch('/api/contacts?search=Search', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(Array.isArray(result.data)).toBe(true)

      // Should include our test contact
      const testContact = result.data.find(
        (c: { name: string }) => c.name === 'TEST Search Contact'
      )
      expect(testContact).toBeDefined()
    })
  })

  describe('GET /api/contacts/[id]', () => {
    it('should retrieve a specific contact', async () => {
      // Create a test contact
      const testContact = await createTestContact(
        testUserId,
        'TEST Contact for Get'
      )

      const response = await fetch(`/api/contacts/${testContact?.id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(testContact?.id)
      expect(result.data.name).toBe('TEST Contact for Get')
    })

    it('should return 404 for non-existent contact', async () => {
      const response = await fetch('/api/contacts/non-existent-id', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/contacts/[id]', () => {
    it('should update a contact', async () => {
      // Create a test contact
      const testContact = await createTestContact(
        testUserId,
        'TEST Contact for Update'
      )

      const updateData = {
        name: 'TEST Updated Contact',
        phone: '+9876543210',
        email: 'updated@example.com',
      }

      const response = await fetch(`/api/contacts/${testContact?.id}`, {
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
      expect(result.data.phone).toBe(updateData.phone)
      expect(result.data.email).toBe(updateData.email)
    })
  })

  describe('DELETE /api/contacts/[id]', () => {
    it('should delete a contact', async () => {
      // Create a test contact
      const testContact = await createTestContact(
        testUserId,
        'TEST Contact for Delete'
      )

      const response = await fetch(`/api/contacts/${testContact?.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.message).toBeDefined()
    })

    it('should return 404 when deleting non-existent contact', async () => {
      const response = await fetch('/api/contacts/non-existent-id', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/contacts/import', () => {
    it('should import contacts from CSV', async () => {
      const csvData = `name,phone,email
TEST Import Contact 1,+1111111111,test1@example.com
TEST Import Contact 2,+2222222222,test2@example.com`

      const formData = new FormData()
      const blob = new Blob([csvData], { type: 'text/csv' })
      formData.append('file', blob, 'contacts.csv')

      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: formData,
      })

      expect(response.status).toBe(200)

      const result = await response.json()
      expect(result.data).toBeDefined()
      expect(result.data.imported).toBe(2)
      expect(result.data.errors).toBe(0)
    })

    it('should handle invalid CSV format', async () => {
      const invalidCsvData = `invalid,csv,format
without,proper,headers`

      const formData = new FormData()
      const blob = new Blob([invalidCsvData], { type: 'text/csv' })
      formData.append('file', blob, 'invalid.csv')

      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
        body: formData,
      })

      expect(response.status).toBe(400)

      const result = await response.json()
      expect(result.error).toBeDefined()
    })
  })

  describe('GET /api/contacts/export', () => {
    it('should export contacts as CSV', async () => {
      // Create a test contact first
      await createTestContact(testUserId, 'TEST Export Contact')

      const response = await fetch('/api/contacts/export', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testUser?.access_token || 'test-token'}`,
        },
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('text/csv')

      const csvContent = await response.text()
      expect(csvContent).toContain('name,phone,email')
      expect(csvContent).toContain('TEST Export Contact')
    })
  })
})
