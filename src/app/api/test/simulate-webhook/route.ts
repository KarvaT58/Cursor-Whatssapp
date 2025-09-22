import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addGroupParticipant, removeGroupParticipant } from '@/lib/group-participants'

// POST /api/test/simulate-webhook - Simular webhook de participante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, groupId, participantPhone, participantName } = body

    if (!action || !groupId || !participantPhone) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: action, groupId, participantPhone' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar dados do grupo antes da operação
    const { data: groupBefore, error: groupBeforeError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, participant_count')
      .eq('id', groupId)
      .single()

    if (groupBeforeError || !groupBefore) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Contar participantes ativos antes da operação
    const { data: participantsBefore, error: participantsBeforeError } = await supabase
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)

    let result
    let message

    if (action === 'add') {
      // Adicionar participante
      result = await addGroupParticipant(
        groupId,
        participantPhone,
        participantName || null,
        false, // isAdmin
        false  // isSuperAdmin
      )
      message = 'Participante adicionado com sucesso'
    } else if (action === 'remove') {
      // Remover participante
      result = await removeGroupParticipant(groupId, participantPhone)
      message = 'Participante removido com sucesso'
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "add" ou "remove"' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Aguardar um pouco para o trigger executar
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Buscar dados do grupo após a operação
    const { data: groupAfter, error: groupAfterError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, participant_count')
      .eq('id', groupId)
      .single()

    // Contar participantes ativos após a operação
    const { data: participantsAfter, error: participantsAfterError } = await supabase
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        groupId,
        participantPhone,
        before: {
          participantCount: groupBefore.participant_count,
          activeParticipants: participantsBefore?.length || 0,
          isConsistent: groupBefore.participant_count === (participantsBefore?.length || 0)
        },
        after: {
          participantCount: groupAfter?.participant_count,
          activeParticipants: participantsAfter?.length || 0,
          isConsistent: groupAfter?.participant_count === (participantsAfter?.length || 0)
        },
        triggerWorked: groupAfter?.participant_count !== groupBefore.participant_count,
        result: result
      }
    })

  } catch (error) {
    console.error('Erro no teste de webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
