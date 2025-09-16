import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const AddParticipantSchema = z.object({
  participantPhone: z.string().min(1, 'Telefone é obrigatório'),
})

const RemoveParticipantSchema = z.object({
  participantPhone: z.string().min(1, 'Telefone é obrigatório'),
})

// POST /api/groups/[id]/participants - Adicionar participante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const body = await request.json()
    const { participantPhone } = AddParticipantSchema.parse(body)

    // Buscar grupo atual
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar grupo:', groupError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupo' },
        { status: 500 }
      )
    }

    // Verificar se participante já existe
    const currentParticipants = group.participants || []
    if (currentParticipants.includes(participantPhone)) {
      return NextResponse.json(
        { error: 'Participante já está no grupo' },
        { status: 400 }
      )
    }

    // Adicionar participante
    const updatedParticipants = [...currentParticipants, participantPhone]

    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({ participants: updatedParticipants })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao adicionar participante:', updateError)
      return NextResponse.json(
        { error: 'Erro ao adicionar participante' },
        { status: 500 }
      )
    }

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de participantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id]/participants - Remover participante
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params
    const body = await request.json()
    const { participantPhone } = RemoveParticipantSchema.parse(body)

    // Buscar grupo atual
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Grupo não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar grupo:', groupError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupo' },
        { status: 500 }
      )
    }

    // Remover participante
    const currentParticipants = group.participants || []
    const updatedParticipants = currentParticipants.filter(
      (p: string) => p !== participantPhone
    )

    const { data: updatedGroup, error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({ participants: updatedParticipants })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao remover participante:', updateError)
      return NextResponse.json(
        { error: 'Erro ao remover participante' },
        { status: 500 }
      )
    }

    return NextResponse.json({ group: updatedGroup })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de participantes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
