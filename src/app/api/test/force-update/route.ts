import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/test/force-update - Forçar atualização de um grupo específico
export async function POST(request: NextRequest) {
  try {
    const { groupId } = await request.json()

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId é obrigatório' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar dados atuais do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Contar participantes ativos
    const { data: participants, error: participantsError } = await supabase
      .from('group_participants')
      .select('id')
      .eq('group_id', groupId)
      .eq('is_active', true)

    const actualCount = participants?.length || 0

    // Se houver inconsistência, corrigir
    if (group.participant_count !== actualCount) {
      const { error: updateError } = await supabase
        .from('whatsapp_groups')
        .update({ participant_count: actualCount })
        .eq('id', groupId)

      if (updateError) {
        return NextResponse.json(
          { error: 'Erro ao atualizar participant_count', details: updateError },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'participant_count corrigido',
        data: {
          groupId,
          before: group.participant_count,
          after: actualCount,
          wasInconsistent: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Grupo já está consistente',
      data: {
        groupId,
        participantCount: group.participant_count,
        actualCount,
        isConsistent: true
      }
    })

  } catch (error) {
    console.error('Erro no endpoint de força atualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
