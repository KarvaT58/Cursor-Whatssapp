import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de encerrar chamada
const EndCallSchema = z.object({
  reason: z.string().max(200, 'Motivo muito longo').optional(),
  notify_participants: z.boolean().default(true),
})

// DELETE /api/groups/[id]/audio-call/[callId] - Encerrar chamada
export async function DELETE(
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
    const body = await request.json().catch(() => ({}))
    const { reason, notify_participants } = EndCallSchema.parse(body)

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
      .select(`
        *,
        audio_call_participants (
          id,
          participant_phone,
          status,
          joined_at,
          left_at
        )
      `)
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

    // Verificar se o usuário pode encerrar a chamada
    const isCallCreator = call.created_by_phone === userPhone
    const isGroupAdmin = group.admins?.includes(userPhone)
    
    if (!isCallCreator && !isGroupAdmin) {
      return NextResponse.json(
        { error: 'Apenas o criador da chamada ou administradores podem encerrar a chamada' },
        { status: 403 }
      )
    }

    // Encerrar a chamada
    const { data: endedCall, error: endError } = await supabase
      .from('group_audio_calls')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        ended_by: user.id,
        end_reason: reason || null,
      })
      .eq('id', callId)
      .select()
      .single()

    if (endError) {
      console.error('Erro ao encerrar chamada:', endError)
      return NextResponse.json(
        { error: 'Erro ao encerrar chamada' },
        { status: 500 }
      )
    }

    // Atualizar status de todos os participantes para 'left'
    const { error: participantsError } = await supabase
      .from('audio_call_participants')
      .update({
        status: 'left',
        left_at: new Date().toISOString(),
      })
      .eq('call_id', callId)
      .eq('status', 'joined')

    if (participantsError) {
      console.error('Erro ao atualizar participantes:', participantsError)
      // Não falhar a operação se a atualização de participantes falhar
    }

    // TODO: Sincronizar com Z-API se whatsapp_id estiver presente
    if (group.whatsapp_id) {
      try {
        // await endWhatsAppAudioCall(group.whatsapp_id, callId)
        console.log(`TODO: Encerrar chamada de áudio ${callId} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    // TODO: Notificar participantes sobre o encerramento
    if (notify_participants) {
      try {
        const activeParticipants = call.audio_call_participants?.filter(p => p.status === 'joined') || []
        // await notifyParticipantsAboutCallEnd(activeParticipants, endedCall, group.name)
        console.log(`TODO: Notificar participantes sobre encerramento da chamada ${callId}`)
      } catch (notificationError) {
        console.error('Erro ao notificar participantes:', notificationError)
        // Não falhar a operação se a notificação falhar
      }
    }

    return NextResponse.json({
      message: 'Chamada encerrada com sucesso',
      call: {
        id: endedCall.id,
        status: endedCall.status,
        ended_at: endedCall.ended_at,
        end_reason: endedCall.end_reason,
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

    console.error('Erro na API de encerrar chamada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/groups/[id]/audio-call/[callId] - Obter detalhes da chamada
export async function GET(
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

    // Buscar a chamada com detalhes
    const { data: call, error: callError } = await supabase
      .from('group_audio_calls')
      .select(`
        *,
        audio_call_participants (
          id,
          participant_phone,
          status,
          joined_at,
          left_at
        )
      `)
      .eq('id', callId)
      .eq('group_id', groupId)
      .single()

    if (callError || !call) {
      return NextResponse.json(
        { error: 'Chamada não encontrada' },
        { status: 404 }
      )
    }

    // Processar participantes
    const participants = call.audio_call_participants || []
    const joinedParticipants = participants.filter(p => p.status === 'joined')
    const invitedParticipants = participants.filter(p => p.status === 'invited')
    const leftParticipants = participants.filter(p => p.status === 'left')

    // Verificar se o usuário pode gerenciar a chamada
    const isCallCreator = call.created_by_phone === userPhone
    const isGroupAdmin = group.admins?.includes(userPhone)
    const canManage = isCallCreator || isGroupAdmin

    return NextResponse.json({
      message: 'Chamada obtida com sucesso',
      call: {
        ...call,
        participants: {
          total: participants.length,
          joined: joinedParticipants.length,
          invited: invitedParticipants.length,
          left: leftParticipants.length,
          list: participants,
        },
        user_status: participants.find(p => p.participant_phone === userPhone)?.status || 'not_invited',
        can_manage: canManage,
        is_creator: isCallCreator,
      },
    })
  } catch (error) {
    console.error('Erro na API de obter chamada:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
