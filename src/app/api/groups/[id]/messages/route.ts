import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validação para parâmetros de query
const getMessagesSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 50)
})

// Schema de validação para criação de mensagem
const createMessageSchema = z.object({
  content: z.string().min(1, 'Conteúdo da mensagem é obrigatório'),
  type: z.enum(['text', 'image', 'document', 'audio']).default('text'),
  mentions: z.array(z.string()).optional().default([]),
  reply_to_message_id: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const { searchParams } = new URL(request.url)
    
    // Validar parâmetros de query
    let page = 1
    let limit = 50
    
    try {
      const parsedParams = getMessagesSchema.parse({
        page: searchParams.get('page'),
        limit: searchParams.get('limit')
      })
      page = parsedParams.page
      limit = parsedParams.limit
    } catch (parseError) {
      // Usar valores padrão se a validação falhar
    }

    // Por enquanto, usar dados mockados para o grupo
    const group = {
      id: groupId,
      name: 'Grupo de Teste',
      participants_count: 3
    }

    // Por enquanto, retornar mensagens mockadas até a tabela group_messages ser criada
    const messages = [
      {
        id: '1',
        group_id: groupId,
        content: 'Bem-vindos ao grupo!',
        type: 'text',
        direction: 'inbound',
        status: 'delivered',
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
        mentions: [],
        reply_to_message_id: null
      },
      {
        id: '2',
        group_id: groupId,
        content: 'Obrigado pela criação do grupo!',
        type: 'text',
        direction: 'outbound',
        status: 'sent',
        created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutos atrás
        mentions: [],
        reply_to_message_id: null
      }
    ]

    const totalMessages = messages.length
    const totalPages = Math.ceil(totalMessages / limit)

    return NextResponse.json({
      messages: messages || [],
      pagination: {
        page,
        limit,
        total: totalMessages || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      group: {
        id: group.id,
        name: group.name,
        participants_count: group.participants_count
      }
    })

  } catch (error) {
    console.error('Erro na API de mensagens:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const body = await request.json()

    // Validar dados da requisição
    const { content, type, mentions, reply_to_message_id } = createMessageSchema.parse(body)

    // Por enquanto, usar dados mockados para o grupo
    const group = {
      id: groupId,
      name: 'Grupo de Teste',
      participants_count: 3
    }

    // Por enquanto, criar mensagem mockada até a tabela group_messages ser criada
    const message = {
      id: Date.now().toString(),
      group_id: groupId,
      content,
      type,
      mentions: mentions || [],
      reply_to_message_id,
      direction: 'outbound',
      status: 'sent',
      created_at: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Mensagem enviada com sucesso',
      message_data: message,
      mentions: {
        valid: mentions || [],
        invalid: []
      },
      group: {
        id: group.id,
        name: group.name,
        participants_count: group.participants_count
      }
    })

  } catch (error) {
    console.error('Erro na API de mensagens:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}