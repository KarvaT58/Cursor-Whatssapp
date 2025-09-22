import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/test/fix-inconsistencies - Corrigir inconsistências no participant_count
export async function POST() {
  try {
    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar inconsistências antes da correção
    const { data: inconsistenciesBefore, error: inconsistenciesBeforeError } = await supabase
      .rpc('check_participant_count_inconsistencies')

    if (inconsistenciesBeforeError) {
      return NextResponse.json(
        { error: 'Erro ao verificar inconsistências', details: inconsistenciesBeforeError },
        { status: 500 }
      )
    }

    // Corrigir todas as inconsistências
    const { data: fixedGroups, error: fixError } = await supabase
      .rpc('fix_all_participant_counts')

    if (fixError) {
      return NextResponse.json(
        { error: 'Erro ao corrigir inconsistências', details: fixError },
        { status: 500 }
      )
    }

    // Verificar inconsistências após a correção
    const { data: inconsistenciesAfter, error: inconsistenciesAfterError } = await supabase
      .rpc('check_participant_count_inconsistencies')

    if (inconsistenciesAfterError) {
      return NextResponse.json(
        { error: 'Erro ao verificar inconsistências após correção', details: inconsistenciesAfterError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Inconsistências corrigidas com sucesso',
      timestamp: new Date().toISOString(),
      data: {
        before: {
          inconsistentGroups: inconsistenciesBefore?.length || 0,
          groups: inconsistenciesBefore || []
        },
        fixed: {
          groupsFixed: fixedGroups?.length || 0,
          groups: fixedGroups || []
        },
        after: {
          inconsistentGroups: inconsistenciesAfter?.length || 0,
          groups: inconsistenciesAfter || []
        }
      }
    })

  } catch (error) {
    console.error('Erro ao corrigir inconsistências:', error)
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
