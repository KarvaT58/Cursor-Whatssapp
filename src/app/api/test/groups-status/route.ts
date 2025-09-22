import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/test/groups-status - Verificar status dos grupos
export async function GET() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar todos os grupos com contagem de participantes
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select(`
        id,
        name,
        participant_count,
        whatsapp_id,
        group_type,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (groupsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar grupos', details: groupsError },
        { status: 500 }
      )
    }

    // Para cada grupo, contar participantes ativos
    const groupsWithParticipants = await Promise.all(
      groups.map(async (group) => {
        const { data: participants, error: participantsError } = await supabase
          .from('group_participants')
          .select('id, participant_phone, participant_name, is_active, created_at')
          .eq('group_id', group.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        return {
          ...group,
          actualParticipantCount: participants?.length || 0,
          participants: participants || [],
          isConsistent: group.participant_count === (participants?.length || 0),
          participantsError: participantsError
        }
      })
    )

    // Calcular estatísticas
    const totalGroups = groupsWithParticipants.length
    const consistentGroups = groupsWithParticipants.filter(g => g.isConsistent).length
    const inconsistentGroups = totalGroups - consistentGroups
    const totalParticipants = groupsWithParticipants.reduce((sum, g) => sum + g.actualParticipantCount, 0)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        totalGroups,
        consistentGroups,
        inconsistentGroups,
        totalParticipants,
        consistencyRate: totalGroups > 0 ? (consistentGroups / totalGroups * 100).toFixed(2) + '%' : '0%'
      },
      groups: groupsWithParticipants
    })

  } catch (error) {
    console.error('Erro ao verificar status dos grupos:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
