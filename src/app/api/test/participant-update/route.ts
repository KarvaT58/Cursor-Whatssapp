import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addGroupParticipant, removeGroupParticipant } from '@/lib/group-participants'

// POST /api/test/participant-update - Teste de atualização de participantes
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

    // Verificar o participant_count atualizado
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, participant_count')
      .eq('id', groupId)
      .single()

    if (groupError) {
      console.error('Erro ao buscar grupo:', groupError)
    }

    // Contar participantes ativos
    const { data: participants, error: participantsError } = await supabase
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)

    if (participantsError) {
      console.error('Erro ao contar participantes:', participantsError)
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        groupId,
        participantPhone,
        group: group,
        participantCount: group?.participant_count,
        activeParticipants: participants?.length || 0,
        isConsistent: group?.participant_count === (participants?.length || 0)
      }
    })

  } catch (error) {
    console.error('Erro no teste de participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
