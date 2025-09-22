import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/test/system-status - Verificar status do sistema
export async function GET() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar triggers ativos
    const { data: triggers, error: triggersError } = await supabase
      .rpc('get_triggers_info')

    // Verificar grupos e participantes
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select(`
        id,
        name,
        participant_count,
        group_participants!inner(count)
      `)
      .limit(10)

    // Verificar participantes ativos
    const { data: participants, error: participantsError } = await supabase
      .from('group_participants')
      .select('group_id, is_active')
      .eq('is_active', true)

    // Verificar inconsistências
    const { data: inconsistencies, error: inconsistenciesError } = await supabase
      .rpc('check_participant_count_inconsistencies')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        triggers: {
          status: triggersError ? 'error' : 'ok',
          data: triggers,
          error: triggersError
        },
        groups: {
          status: groupsError ? 'error' : 'ok',
          count: groups?.length || 0,
          data: groups,
          error: groupsError
        },
        participants: {
          status: participantsError ? 'error' : 'ok',
          activeCount: participants?.length || 0,
          error: participantsError
        },
        inconsistencies: {
          status: inconsistenciesError ? 'error' : 'ok',
          data: inconsistencies,
          error: inconsistenciesError
        }
      }
    })

  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error)
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
