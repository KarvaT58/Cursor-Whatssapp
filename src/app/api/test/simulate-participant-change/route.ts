import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addGroupParticipant, removeGroupParticipant } from '@/lib/group-participants'

// POST /api/test/simulate-participant-change - Simular mudança de participante
export async function POST(request: NextRequest) {
  try {
    const { action, groupId, participantPhone, participantName } = await request.json()

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

    let result
    let message

    if (action === 'add') {
      // Simular entrada de participante
      result = await addGroupParticipant(
        groupId,
        participantPhone,
        participantName || 'Participante Teste',
        false, // isAdmin
        false  // isSuperAdmin
      )
      message = 'Participante adicionado com sucesso'
    } else if (action === 'remove') {
      // Simular saída de participante
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

    // Criar notificação para testar o sistema de notificações
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: groupId,
        user_id: '2cf216c9-1234-4a9c-8f91-4b224032d671', // User ID fixo para teste
        type: action === 'add' ? 'member_added' : 'member_removed',
        title: groupBefore.name,
        message: `Participante ${action === 'add' ? 'adicionado' : 'removido'} via teste`,
        data: {
          action,
          participantPhone,
          participantName: participantName || 'Participante Teste',
          timestamp: new Date().toISOString()
        }
      })

    return NextResponse.json({
      success: true,
      message,
      data: {
        action,
        groupId,
        participantPhone,
        before: {
          participantCount: groupBefore.participant_count,
          groupName: groupBefore.name
        },
        after: {
          participantCount: groupAfter?.participant_count,
          actualActiveParticipants: participantsAfter?.length || 0,
          isConsistent: groupAfter?.participant_count === (participantsAfter?.length || 0)
        },
        triggerWorked: groupAfter?.participant_count !== groupBefore.participant_count,
        notificationCreated: !notificationError,
        result: result
      }
    })

  } catch (error) {
    console.error('Erro no teste de mudança de participante:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
