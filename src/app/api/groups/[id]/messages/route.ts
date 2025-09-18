import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de mensagens
const SendMessageSchema = z.object({
  content: z.string().min(1, 'Conteúdo é obrigatório').max(4096, 'Mensagem muito longa'),
  type: z.enum(['text', 'image', 'document', 'audio']).default('text'),
  mentions: z.array(z.string()).optional().default([]),
  reply_to_message_id: z.string().optional(),
})

// POST /api/groups/[id]/messages - Enviar mensagem para o grupo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const groupId = params.id
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { content, type, mentions, reply_to_message_id } = SendMessageSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, whatsapp_id, participants, admins')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante do grupo
    const participants = existingGroup.participants || []
    const admins = existingGroup.admins || []
    const userPhone = user.phone || user.email // Assumindo que temos o telefone do usuário
    
    if (!participants.includes(userPhone) && !admins.includes(userPhone)) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Validar menções
    const validMentions = mentions.filter(mention => {
      if (mention === '@grupo') {
        // Apenas administradores podem mencionar o grupo
        return admins.includes(userPhone)
      }
      // Verificar se o telefone mencionado está no grupo
      return participants.includes(mention)
    })

    const invalidMentions = mentions.filter(mention => !validMentions.includes(mention))

    // Criar mensagem no banco
    const { data: message, error: messageError } = await supabase
      .from('whatsapp_messages')
      .insert({
        group_id: groupId,
        contact_id: null,
        content,
        type,
        direction: 'outbound',
        status: 'sent',
        whatsapp_message_id: null, // Será preenchido pela Z-API
        user_id: user.id,
        mentions: validMentions,
        reply_to_message_id: reply_to_message_id || null,
      })
      .select()
      .single()

    if (messageError) {
      console.error('Erro ao criar mensagem:', messageError)
      return NextResponse.json(
        { error: 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (existingGroup.whatsapp_id) {
      try {
        // Aqui seria feita a chamada para a Z-API para enviar mensagem no WhatsApp
        // await sendMessageToWhatsAppGroup(existingGroup.whatsapp_id, content, validMentions)
        console.log(`TODO: Enviar mensagem para o grupo ${existingGroup.whatsapp_id} no WhatsApp:`, {
          content,
          mentions: validMentions,
          type
        })
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Mensagem enviada com sucesso',
      message_data: message,
      mentions: {
        valid: validMentions,
        invalid: invalidMentions,
      },
      group: {
        id: existingGroup.id,
        name: existingGroup.name,
        participants_count: participants.length,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de envio de mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/messages - Buscar mensagens do grupo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const groupId = params.id
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: existingGroup, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, participants, admins')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingGroup) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Extrair parâmetros de paginação
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Buscar mensagens do grupo
    const { data: messages, error: messagesError, count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact' })
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      console.error('Erro ao buscar mensagens:', messagesError)
      return NextResponse.json(
        { error: 'Erro ao buscar mensagens' },
        { status: 500 }
      )
    }

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      messages: messages || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      group: {
        id: existingGroup.id,
        name: existingGroup.name,
        participants_count: existingGroup.participants?.length || 0,
      },
    })
  } catch (error) {
    console.error('Erro na API de busca de mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
