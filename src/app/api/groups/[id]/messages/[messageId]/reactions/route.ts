import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de reação
const ReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji é obrigatório').max(10, 'Emoji inválido'),
})

// POST /api/groups/[id]/messages/[messageId]/reactions - Adicionar/alterar reação
export async function POST(
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
    const body = await request.json()
    const { emoji } = ReactionSchema.parse(body)

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

    // Verificar se a mensagem existe e pertence ao grupo
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

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Verificar se já existe uma reação do usuário para esta mensagem
    const { data: existingReaction, error: existingError } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)
      .eq('user_phone', userPhone)
      .single()

    if (existingReaction) {
      // Atualizar reação existente
      const { data: updatedReaction, error: updateError } = await supabase
        .from('message_reactions')
        .update({
          emoji,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingReaction.id)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar reação:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar reação' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Reação atualizada com sucesso',
        reaction: updatedReaction,
        action: 'updated',
      })
    } else {
      // Criar nova reação
      const { data: newReaction, error: createError } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_phone: userPhone,
          emoji,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar reação:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar reação' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Reação adicionada com sucesso',
        reaction: newReaction,
        action: 'created',
      })
    }
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

    console.error('Erro na API de reações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/messages/[messageId]/reactions - Remover reação
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

    // Verificar se a mensagem existe e pertence ao grupo
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

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Verificar se existe uma reação do usuário para esta mensagem
    const { data: existingReaction, error: existingError } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)
      .eq('user_phone', userPhone)
      .single()

    if (!existingReaction) {
      return NextResponse.json(
        { error: 'Reação não encontrada' },
        { status: 404 }
      )
    }

    // Remover a reação
    const { error: deleteError } = await supabase
      .from('message_reactions')
      .delete()
      .eq('id', existingReaction.id)

    if (deleteError) {
      console.error('Erro ao remover reação:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao remover reação' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Reação removida com sucesso',
      action: 'deleted',
    })
  } catch (error) {
    console.error('Erro na API de remoção de reação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/messages/[messageId]/reactions - Listar reações da mensagem
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

    // Verificar se a mensagem existe e pertence ao grupo
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

    // Verificar se o usuário é participante do grupo
    const userPhone = user.phone || user.email
    const isParticipant = group.participants?.includes(userPhone)
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Você não é participante deste grupo' },
        { status: 403 }
      )
    }

    // Buscar todas as reações da mensagem
    const { data: reactions, error: reactionsError } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true })

    if (reactionsError) {
      console.error('Erro ao buscar reações:', reactionsError)
      return NextResponse.json(
        { error: 'Erro ao buscar reações' },
        { status: 500 }
      )
    }

    // Agrupar reações por emoji e contar
    const reactionCounts = reactions?.reduce((acc, reaction) => {
      const emoji = reaction.emoji
      if (!acc[emoji]) {
        acc[emoji] = {
          emoji,
          count: 0,
          users: [],
          userReacted: false,
        }
      }
      acc[emoji].count++
      acc[emoji].users.push(reaction.user_phone)
      if (reaction.user_phone === userPhone) {
        acc[emoji].userReacted = true
      }
      return acc
    }, {} as Record<string, any>) || {}

    return NextResponse.json({
      message: 'Reações obtidas com sucesso',
      reactions: Object.values(reactionCounts),
      total_reactions: reactions?.length || 0,
      user_reaction: reactions?.find(r => r.user_phone === userPhone)?.emoji || null,
    })
  } catch (error) {
    console.error('Erro na API de listagem de reações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
