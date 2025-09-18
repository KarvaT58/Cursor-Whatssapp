import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de apagar mensagem
const DeleteMessageSchema = z.object({
  reason: z.string().max(200, 'Motivo muito longo').optional(),
  notify_author: z.boolean().default(true),
})

// DELETE /api/groups/[id]/messages/[messageId] - Apagar mensagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
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
    const messageId = params.messageId

    if (!groupId || !messageId) {
      return NextResponse.json({ error: 'IDs do grupo e mensagem são obrigatórios' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json().catch(() => ({}))
    const { reason, notify_author } = DeleteMessageSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é administrador do grupo
    const userPhone = user.phone || user.email
    const isAdmin = group.admins?.includes(userPhone)
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem apagar mensagens' },
        { status: 403 }
      )
    }

    // Buscar a mensagem
    const { data: message, error: messageError } = await supabase
      .from('group_messages')
      .select('*')
      .eq('id', messageId)
      .eq('group_id', groupId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a mensagem já foi apagada
    if (message.is_deleted) {
      return NextResponse.json(
        { error: 'Esta mensagem já foi apagada' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode apagar a mensagem
    const isMessageAuthor = message.sender_phone === userPhone
    const isGroupCreator = group.participants?.[0] === userPhone // Assumindo que o primeiro participante é o criador
    
    // Regras de moderação:
    // 1. Administradores podem apagar qualquer mensagem
    // 2. Usuários podem apagar apenas suas próprias mensagens
    // 3. Criador do grupo pode apagar qualquer mensagem
    if (!isMessageAuthor && !isGroupCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Você só pode apagar suas próprias mensagens' },
        { status: 403 }
      )
    }

    // Verificar se é um administrador tentando apagar mensagem de outro administrador
    const messageAuthorIsAdmin = group.admins?.includes(message.sender_phone)
    if (isAdmin && messageAuthorIsAdmin && !isGroupCreator && message.sender_phone !== userPhone) {
      return NextResponse.json(
        { error: 'Administradores não podem apagar mensagens de outros administradores' },
        { status: 403 }
      )
    }

    // Apagar a mensagem (soft delete)
    const { data: deletedMessage, error: deleteError } = await supabase
      .from('group_messages')
      .update({
        is_deleted: true,
        deleted_by: user.id,
        deleted_at: new Date().toISOString(),
        content: '[Mensagem apagada]', // Substituir conteúdo por placeholder
      })
      .eq('id', messageId)
      .select()
      .single()

    if (deleteError) {
      console.error('Erro ao apagar mensagem:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao apagar mensagem' },
        { status: 500 }
      )
    }

    // Registrar ação de moderação
    const { error: moderationError } = await supabase
      .from('moderation_actions')
      .insert({
        group_id: groupId,
        message_id: messageId,
        action_type: 'delete_message',
        moderator_id: user.id,
        moderator_phone: userPhone,
        target_user_phone: message.sender_phone,
        reason: reason || null,
        created_at: new Date().toISOString(),
      })

    if (moderationError) {
      console.error('Erro ao registrar ação de moderação:', moderationError)
      // Não falhar a operação se o registro de moderação falhar
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id && message.whatsapp_message_id) {
      try {
        // await deleteWhatsAppMessage(group.whatsapp_id, message.whatsapp_message_id)
        console.log(`TODO: Apagar mensagem ${message.whatsapp_message_id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    // TODO: Notificar o autor da mensagem se solicitado
    if (notify_author && message.sender_phone !== userPhone) {
      try {
        // await notifyMessageDeleted(message.sender_phone, group.name, reason)
        console.log(`TODO: Notificar ${message.sender_phone} sobre mensagem apagada`)
      } catch (notificationError) {
        console.error('Erro ao notificar autor:', notificationError)
        // Não falhar a operação se a notificação falhar
      }
    }

    return NextResponse.json({
      message: 'Mensagem apagada com sucesso',
      deleted_message: {
        id: deletedMessage.id,
        deleted_at: deletedMessage.deleted_at,
        deleted_by: deletedMessage.deleted_by,
        reason: reason || null,
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

    console.error('Erro na API de apagar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/messages/[messageId] - Obter detalhes da mensagem
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
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
    const messageId = params.messageId

    if (!groupId || !messageId) {
      return NextResponse.json({ error: 'IDs do grupo e mensagem são obrigatórios' }, { status: 400 })
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Buscar a mensagem com detalhes
    const { data: message, error: messageError } = await supabase
      .from('group_messages')
      .select(`
        *,
        message_reactions (
          id,
          user_phone,
          emoji,
          created_at
        )
      `)
      .eq('id', messageId)
      .eq('group_id', groupId)
      .single()

    if (messageError || !message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário pode ver a mensagem
    const isMessageAuthor = message.sender_phone === userPhone
    const isAdmin = group.admins?.includes(userPhone)
    
    // Se a mensagem foi apagada, apenas o autor ou administradores podem ver os detalhes
    if (message.is_deleted && !isMessageAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Esta mensagem foi apagada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Mensagem obtida com sucesso',
      message_data: {
        ...message,
        can_delete: isMessageAuthor || isAdmin,
        can_see_deleted: isMessageAuthor || isAdmin,
      },
    })
  } catch (error) {
    console.error('Erro na API de obter mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
