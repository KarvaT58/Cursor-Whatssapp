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

    // Buscar dados da família
    const { data: family, error: familyError } = await supabase
      .from('group_families')
      .select('*')
      .eq('id', familyId)
      .single()

    if (familyError) {
      console.error('Erro ao buscar família:', familyError)
      return NextResponse.json(
        { error: 'Família não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: family.id,
      name: family.name,
      description: family.description,
      created_at: family.created_at
    })

  } catch (error) {
    console.error('Erro na API de família:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
