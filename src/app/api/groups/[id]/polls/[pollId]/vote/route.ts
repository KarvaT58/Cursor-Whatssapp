import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de voto
const VoteSchema = z.object({
  selected_options: z.array(z.number().min(0, 'Índice de opção inválido'))
    .min(1, 'Selecione pelo menos uma opção')
    .max(12, 'Máximo 12 opções'),
})

// POST /api/groups/[id]/polls/[pollId]/vote - Votar em enquete
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
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
    const pollId = params.pollId

    if (!groupId || !pollId) {
      return NextResponse.json({ error: 'IDs do grupo e enquete são obrigatórios' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { selected_options } = VoteSchema.parse(body)

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

    // Verificar se a enquete existe e pertence ao grupo
    const { data: poll, error: pollError } = await supabase
      .from('group_polls')
      .select('*')
      .eq('id', pollId)
      .eq('group_id', groupId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Enquete não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a enquete expirou
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Esta enquete já expirou' },
        { status: 400 }
      )
    }

    // Validar se as opções selecionadas são válidas
    const maxOptionIndex = poll.options.length - 1
    const invalidOptions = selected_options.filter(option => 
      option < 0 || option > maxOptionIndex
    )
    
    if (invalidOptions.length > 0) {
      return NextResponse.json(
        { error: 'Opções selecionadas são inválidas' },
        { status: 400 }
      )
    }

    // Verificar se múltiplas opções são permitidas
    if (!poll.allow_multiple && selected_options.length > 1) {
      return NextResponse.json(
        { error: 'Esta enquete permite apenas uma opção' },
        { status: 400 }
      )
    }

    // Verificar se o usuário já votou
    const { data: existingVote, error: existingError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_phone', userPhone)
      .single()

    if (existingVote) {
      // Atualizar voto existente
      const { data: updatedVote, error: updateError } = await supabase
        .from('poll_votes')
        .update({
          selected_options,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar voto:', updateError)
        return NextResponse.json(
          { error: 'Erro ao atualizar voto' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Voto atualizado com sucesso',
        vote: updatedVote,
        action: 'updated',
      })
    } else {
      // Criar novo voto
      const { data: newVote, error: createError } = await supabase
        .from('poll_votes')
        .insert({
          poll_id: pollId,
          user_phone: userPhone,
          selected_options,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar voto:', createError)
        return NextResponse.json(
          { error: 'Erro ao criar voto' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Voto registrado com sucesso',
        vote: newVote,
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

    console.error('Erro na API de votação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/polls/[pollId]/vote - Remover voto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; pollId: string } }
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
    const pollId = params.pollId

    if (!groupId || !pollId) {
      return NextResponse.json({ error: 'IDs do grupo e enquete são obrigatórios' }, { status: 400 })
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

    // Verificar se a enquete existe e pertence ao grupo
    const { data: poll, error: pollError } = await supabase
      .from('group_polls')
      .select('*')
      .eq('id', pollId)
      .eq('group_id', groupId)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Enquete não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário já votou
    const { data: existingVote, error: existingError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_phone', userPhone)
      .single()

    if (!existingVote) {
      return NextResponse.json(
        { error: 'Você ainda não votou nesta enquete' },
        { status: 404 }
      )
    }

    // Remover o voto
    const { error: deleteError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('id', existingVote.id)

    if (deleteError) {
      console.error('Erro ao remover voto:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao remover voto' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Voto removido com sucesso',
      action: 'deleted',
    })
  } catch (error) {
    console.error('Erro na API de remoção de voto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
