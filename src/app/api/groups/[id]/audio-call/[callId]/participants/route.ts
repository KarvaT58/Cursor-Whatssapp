import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de ações de participante
const ParticipantActionSchema = z.object({
  action: z.enum(['join', 'leave', 'invite', 'remove'], {
    errorMap: () => ({ message: 'Ação inválida' })
  }),
  participant_phone: z.string().min(1, 'Telefone é obrigatório').optional(),
  participants: z.array(z.string().min(1, 'Telefone inválido')).optional(),
})

// POST /api/groups/[id]/audio-call/[callId]/participants - Ações de participante
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; callId: string } }
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
    const callId = params.callId

    if (!groupId || !callId) {
      return NextResponse.json({ error: 'IDs do grupo e chamada são obrigatórios' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { action, participant_phone, participants } = ParticipantActionSchema.parse(body)

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

    // Buscar a chamada
    const { data: call, error: callError } = await supabase
      .from('group_audio_calls')
      .select('*')
      .eq('id', callId)
      .eq('group_id', groupId)
      .single()

    if (callError || !call) {
      return NextResponse.json(
        { error: 'Chamada não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a chamada está ativa
    if (call.status !== 'active') {
      return NextResponse.json(
        { error: 'Esta chamada não está ativa' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode realizar a ação
    const isCallCreator = call.created_by_phone === userPhone
    const isGroupAdmin = group.admins?.includes(userPhone)

    switch (action) {
      case 'join':
        // Qualquer participante do grupo pode tentar entrar
        if (!participant_phone || participant_phone !== userPhone) {
          return NextResponse.json(
            { error: 'Você só pode entrar na chamada com seu próprio telefone' },
            { status: 403 }
          )
        }
        break

      case 'leave':
        // Qualquer participante pode sair
        if (!participant_phone || participant_phone !== userPhone) {
          return NextResponse.json(
            { error: 'Você só pode sair da chamada com seu próprio telefone' },
            { status: 403 }
          )
        }
        break

      case 'invite':
        // Apenas criador da chamada ou admin pode convidar
        if (!isCallCreator && !isGroupAdmin) {
          return NextResponse.json(
            { error: 'Apenas o criador da chamada ou administradores podem convidar participantes' },
            { status: 403 }
          )
        }
        break

      case 'remove':
        // Apenas criador da chamada ou admin pode remover
        if (!isCallCreator && !isGroupAdmin) {
          return NextResponse.json(
            { error: 'Apenas o criador da chamada ou administradores podem remover participantes' },
            { status: 403 }
          )
        }
        break
    }

    // Executar ação
    switch (action) {
      case 'join':
        // Verificar se já está na chamada
        const { data: existingParticipation, error: existingError } = await supabase
          .from('audio_call_participants')
          .select('*')
          .eq('call_id', callId)
          .eq('participant_phone', userPhone)
          .single()

        if (existingParticipation) {
          if (existingParticipation.status === 'joined') {
            return NextResponse.json(
              { error: 'Você já está na chamada' },
              { status: 400 }
            )
          }

          // Atualizar status para joined
          const { error: updateError } = await supabase
            .from('audio_call_participants')
            .update({
              status: 'joined',
              joined_at: new Date().toISOString(),
            })
            .eq('id', existingParticipation.id)

          if (updateError) {
            console.error('Erro ao entrar na chamada:', updateError)
            return NextResponse.json(
              { error: 'Erro ao entrar na chamada' },
              { status: 500 }
            )
          }
        } else {
          // Criar novo registro de participação
          const { error: createError } = await supabase
            .from('audio_call_participants')
            .insert({
              call_id: callId,
              participant_phone: userPhone,
              status: 'joined',
              joined_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            })

          if (createError) {
            console.error('Erro ao entrar na chamada:', createError)
            return NextResponse.json(
              { error: 'Erro ao entrar na chamada' },
              { status: 500 }
            )
          }
        }

        return NextResponse.json({
          message: 'Você entrou na chamada com sucesso',
          action: 'joined',
        })

      case 'leave':
        // Atualizar status para left
        const { error: leaveError } = await supabase
          .from('audio_call_participants')
          .update({
            status: 'left',
            left_at: new Date().toISOString(),
          })
          .eq('call_id', callId)
          .eq('participant_phone', userPhone)

        if (leaveError) {
          console.error('Erro ao sair da chamada:', leaveError)
          return NextResponse.json(
            { error: 'Erro ao sair da chamada' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Você saiu da chamada com sucesso',
          action: 'left',
        })

      case 'invite':
        if (!participants || participants.length === 0) {
          return NextResponse.json(
            { error: 'Lista de participantes é obrigatória' },
            { status: 400 }
          )
        }

        // Verificar se os participantes são membros do grupo
        const validParticipants = participants.filter(phone => 
          group.participants?.includes(phone)
        )

        if (validParticipants.length !== participants.length) {
          return NextResponse.json(
            { error: 'Alguns participantes não são membros do grupo' },
            { status: 400 }
          )
        }

        // Verificar limite de participantes
        const { data: currentParticipants, error: currentError } = await supabase
          .from('audio_call_participants')
          .select('*')
          .eq('call_id', callId)

        if (currentError) {
          console.error('Erro ao buscar participantes atuais:', currentError)
          return NextResponse.json(
            { error: 'Erro ao buscar participantes atuais' },
            { status: 500 }
          )
        }

        const totalParticipants = (currentParticipants?.length || 0) + validParticipants.length
        if (totalParticipants > 32) {
          return NextResponse.json(
            { error: 'Máximo 32 participantes permitidos' },
            { status: 400 }
          )
        }

        // Criar registros de participação para convidados
        const invitationRecords = validParticipants.map(phone => ({
          call_id: callId,
          participant_phone: phone,
          status: 'invited',
          created_at: new Date().toISOString(),
        }))

        const { error: inviteError } = await supabase
          .from('audio_call_participants')
          .insert(invitationRecords)

        if (inviteError) {
          console.error('Erro ao convidar participantes:', inviteError)
          return NextResponse.json(
            { error: 'Erro ao convidar participantes' },
            { status: 500 }
          )
        }

        // TODO: Notificar participantes convidados
        try {
          // await notifyInvitedParticipants(validParticipants, call, group.name)
          console.log(`TODO: Notificar participantes convidados para chamada ${callId}`)
        } catch (notificationError) {
          console.error('Erro ao notificar participantes:', notificationError)
        }

        return NextResponse.json({
          message: `${validParticipants.length} participantes convidados com sucesso`,
          action: 'invited',
          invited_count: validParticipants.length,
        })

      case 'remove':
        if (!participant_phone) {
          return NextResponse.json(
            { error: 'Telefone do participante é obrigatório' },
            { status: 400 }
          )
        }

        // Verificar se o participante está na chamada
        const { data: participantToRemove, error: participantError } = await supabase
          .from('audio_call_participants')
          .select('*')
          .eq('call_id', callId)
          .eq('participant_phone', participant_phone)
          .single()

        if (!participantToRemove) {
          return NextResponse.json(
            { error: 'Participante não encontrado na chamada' },
            { status: 404 }
          )
        }

        // Não permitir remover o criador da chamada
        if (participant_phone === call.created_by_phone) {
          return NextResponse.json(
            { error: 'Não é possível remover o criador da chamada' },
            { status: 400 }
          )
        }

        // Remover participante
        const { error: removeError } = await supabase
          .from('audio_call_participants')
          .update({
            status: 'removed',
            left_at: new Date().toISOString(),
          })
          .eq('id', participantToRemove.id)

        if (removeError) {
          console.error('Erro ao remover participante:', removeError)
          return NextResponse.json(
            { error: 'Erro ao remover participante' },
            { status: 500 }
          )
        }

        // TODO: Notificar participante removido
        try {
          // await notifyRemovedParticipant(participant_phone, call, group.name)
          console.log(`TODO: Notificar ${participant_phone} sobre remoção da chamada`)
        } catch (notificationError) {
          console.error('Erro ao notificar participante removido:', notificationError)
        }

        return NextResponse.json({
          message: 'Participante removido com sucesso',
          action: 'removed',
          removed_participant: participant_phone,
        })

      default:
        return NextResponse.json(
          { error: 'Ação não implementada' },
          { status: 400 }
        )
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

    console.error('Erro na API de ações de participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
