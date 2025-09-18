import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { DELETE as deleteMessage } from '@/app/api/groups/[id]/messages/[messageId]/route'
import { POST as createReport } from '@/app/api/groups/[id]/reports/route'
import { PUT as processReport } from '@/app/api/groups/[id]/reports/[reportId]/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Moderation API Endpoints', () => {
  let mockSupabase: any

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    phone: '5511999999999',
  }

  const mockGroup = {
    id: 'group-123',
    name: 'Test Group',
    whatsapp_id: '120363123456789012@g.us',
    participants: ['5511999999999', '5511888888888'],
    admins: ['5511999999999'],
    user_id: 'user-123',
  }

  const mockMessage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    group_id: 'group-123',
    content: 'Test message',
    sender_phone: '5511888888888',
    is_deleted: false,
    created_at: new Date().toISOString(),
  }

  const mockReport = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    group_id: 'group-123',
    message_id: '123e4567-e89b-12d3-a456-426614174000',
    reporter_phone: '5511999999999',
    reported_user_phone: '5511888888888',
    reason: 'spam',
    status: 'pending',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock Supabase
    mockSupabase = {
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
        single: vi.fn(),
      })),
    }

    // Mock createClient
    vi.mocked(createClient).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('DELETE /api/groups/[id]/messages/[messageId] - Delete Message', () => {
    it('should delete a message successfully', async () => {
      // Mock group exists and user is admin
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_messages') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockMessage,
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          }
        }
        if (table === 'moderation_actions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: { id: 'action-123' },
              error: null,
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages/123e4567-e89b-12d3-a456-426614174000', {
        method: 'DELETE',
        body: JSON.stringify({
          reason: 'Inappropriate content',
          notify_author: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await deleteMessage(request, {
        params: { id: 'group-123', messageId: '123e4567-e89b-12d3-a456-426614174000' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem apagada com sucesso')
    })

    it('should return 404 for non-existent group', async () => {
      // Mock group not found
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'whatsapp_groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/non-existent/messages/message-123', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await deleteMessage(request, {
        params: { id: 'non-existent', messageId: 'message-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Grupo não encontrado')
    })

    it('should return 404 for non-existent message', async () => {
      // Mock group exists but message not found
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_messages') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages/non-existent', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await deleteMessage(request, {
        params: { id: 'group-123', messageId: 'non-existent' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Mensagem não encontrada')
    })

    it('should handle Z-API errors gracefully', async () => {
      // Mock group exists and user is admin
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_messages') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockMessage,
              error: null,
            }),
            update: vi.fn().mockReturnThis(),
          }
        }
        if (table === 'moderation_actions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: { id: 'action-123' },
              error: null,
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages/123e4567-e89b-12d3-a456-426614174000', {
        method: 'DELETE',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await deleteMessage(request, {
        params: { id: 'group-123', messageId: '123e4567-e89b-12d3-a456-426614174000' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem apagada com sucesso')
    })
  })

  describe('POST /api/groups/[id]/reports - Create Report', () => {
    it('should create a report successfully', async () => {
      // Mock group exists and user is participant
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_messages') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockMessage,
              error: null,
            }),
          }
        }
        if (table === 'group_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null, // No existing report
              error: { code: 'PGRST116' },
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockReport,
                  error: null,
                }),
              }),
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/reports', {
        method: 'POST',
        body: JSON.stringify({
          message_id: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'spam',
          description: 'This is spam',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createReport(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Denúncia criada com sucesso')
    })

    it('should return 404 for non-existent group', async () => {
      // Mock group not found
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'whatsapp_groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/non-existent/reports', {
        method: 'POST',
        body: JSON.stringify({
          message_id: '123e4567-e89b-12d3-a456-426614174000',
          reason: 'spam',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createReport(request, {
        params: { id: 'non-existent' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Grupo não encontrado')
    })

    it('should validate report data', async () => {
      const request = new NextRequest('http://localhost:3000/api/groups/group-123/reports', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          reason: 'invalid_reason',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await createReport(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })
  })

  describe('PUT /api/groups/[id]/reports/[reportId] - Process Report', () => {
    it('should process a report successfully', async () => {
      // Mock group exists and user is admin
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockReport, group_messages: mockMessage },
              error: null,
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { ...mockReport, status: 'approved' },
                    error: null,
                  }),
                }),
              }),
            }),
          }
        }
        if (table === 'group_messages') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: { id: 'message-123' },
                error: null,
              }),
            }),
          }
        }
        if (table === 'moderation_actions') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: { id: 'action-123' },
              error: null,
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/reports/123e4567-e89b-12d3-a456-426614174001', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'approve',
          moderator_notes: 'Approved after review',
          auto_delete_message: true,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await processReport(request, {
        params: { id: 'group-123', reportId: '123e4567-e89b-12d3-a456-426614174001' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Denúncia aprovada com sucesso')
    })

    it('should return 404 for non-existent report', async () => {
      // Mock group exists but report not found
      mockSupabase.from.mockImplementation((table) => {
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
        if (table === 'group_reports') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' },
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn(),
        }
      })

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/reports/non-existent', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'approve',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await processReport(request, {
        params: { id: 'group-123', reportId: 'non-existent' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Denúncia não encontrada')
    })

    it('should validate action type', async () => {
      const request = new NextRequest('http://localhost:3000/api/groups/group-123/reports/123e4567-e89b-12d3-a456-426614174001', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'invalid_action',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await processReport(request, {
        params: { id: 'group-123', reportId: '123e4567-e89b-12d3-a456-426614174001' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })
  })
})