import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as sendGroupMessage } from '@/app/api/groups/[id]/messages/route'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Mentions System API Endpoints', () => {
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
    id: 'message-123',
    group_id: 'group-123',
    content: 'Olá @5511999999999, como está?',
    type: 'text',
    direction: 'outbound',
    status: 'sent',
    mentions: ['5511999999999'],
    user_id: 'user-123',
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

  describe('POST /api/groups/[id]/messages - Send Message with Mentions', () => {
    it('should send a message with single mention successfully', async () => {
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
        if (table === 'whatsapp_messages') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: mockMessage,
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

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Olá @5511999999999, como está?',
          type: 'text',
          mentions: ['5511999999999'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem enviada com sucesso')
      expect(responseData.message_data.content).toBe('Olá @5511999999999, como está?')
    })

    it('should send a message with multiple mentions successfully', async () => {
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
        if (table === 'whatsapp_messages') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockMessage, mentions: ['5511999999999', '5511888888888'] },
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

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Olá @5511999999999 e @5511888888888!',
          type: 'text',
          mentions: ['5511999999999', '5511888888888'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem enviada com sucesso')
      expect(responseData.mentions.valid).toEqual(['5511999999999', '5511888888888'])
    })

    it('should send a message with @everyone mention successfully', async () => {
      // Mock group exists and user is admin
      const adminGroup = { ...mockGroup, admins: ['5511999999999'] }
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'whatsapp_groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: adminGroup,
              error: null,
            }),
          }
        }
        if (table === 'whatsapp_messages') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockMessage, mentions: ['@grupo'] },
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

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Atenção @grupo!',
          type: 'text',
          mentions: ['@grupo'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem enviada com sucesso')
      expect(responseData.mentions.valid).toEqual(['@grupo'])
    })

    it('should send a message with @admins mention successfully', async () => {
      // Mock group exists and user is admin
      const adminGroup = { ...mockGroup, admins: ['5511999999999'] }
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'whatsapp_groups') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: adminGroup,
              error: null,
            }),
          }
        }
        if (table === 'whatsapp_messages') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockMessage, mentions: ['@admins'] },
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

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Atenção @admins!',
          type: 'text',
          mentions: ['@admins'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Mensagem enviada com sucesso')
      expect(responseData.mentions.valid).toEqual([])
    })

    it('should validate mention format', async () => {
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
        if (table === 'whatsapp_messages') {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { ...mockMessage, mentions: [] },
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

      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Invalid mention @invalid',
          type: 'text',
          mentions: ['@invalid'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.mentions.invalid).toContain('@invalid')
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

      const request = new NextRequest('http://localhost:3000/api/groups/non-existent/messages', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Test message',
          type: 'text',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'non-existent' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('Grupo não encontrado')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/groups/group-123/messages', {
        method: 'POST',
        body: JSON.stringify({
          // Missing content
          type: 'text',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await sendGroupMessage(request, {
        params: { id: 'group-123' }
      })

      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.error).toBe('Dados inválidos')
    })
  })
})