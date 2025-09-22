import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const { familyId } = params

    if (!familyId) {
      return NextResponse.json(
        { error: 'ID da família é obrigatório' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createClient()

    // Buscar dados da família usando a nova estrutura unificada
    // Primeiro tentar buscar por ID do grupo
    let { data: familyGroup, error: familyError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('group_type', 'universal')
      .eq('id', familyId)
      .single()

    // Se não encontrar por ID, tentar buscar por family_name
    if (familyError && familyError.code === 'PGRST116') {
      const { data: familyGroupByName, error: familyErrorByName } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('group_type', 'universal')
        .eq('family_name', familyId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      
      familyGroup = familyGroupByName
      familyError = familyErrorByName
    }

    if (familyError || !familyGroup) {
      console.error('Erro ao buscar família:', familyError)
      return NextResponse.json(
        { error: 'Família não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: familyGroup.id,
      name: familyGroup.family_name,
      description: familyGroup.description,
      created_at: familyGroup.created_at
    })

  } catch (error) {
    console.error('Erro na API de família:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
