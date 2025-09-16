import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UpdateContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido')
    .optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notas muito longas').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

// GET /api/contacts/[id] - Buscar contato específico
export async function GET(
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

    const resolvedParams = await params
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contato não encontrado' },
          { status: 404 }
        )
      }
      console.error('Erro ao buscar contato:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar contato' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Erro no endpoint GET /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/contacts/[id] - Atualizar contato
export async function PUT(
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

    const body = await request.json()

    // Validar dados
    const validatedData = UpdateContactSchema.parse(body)

    const resolvedParams = await params
    // Verificar se o contato existe e pertence ao usuário
    const { data: existingContact, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingContact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // Se o telefone está sendo atualizado, verificar se não existe outro contato com o mesmo telefone
    if (validatedData.phone) {
      const { data: phoneConflict } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('phone', validatedData.phone)
        .neq('id', resolvedParams.id)
        .single()

      if (phoneConflict) {
        return NextResponse.json(
          { error: 'Já existe um contato com este telefone' },
          { status: 400 }
        )
      }
    }

    // Atualizar contato
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar contato:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar contato' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Erro no endpoint PUT /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/contacts/[id] - Deletar contato
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

    const resolvedParams = await params
    // Verificar se o contato existe e pertence ao usuário
    const { data: existingContact, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingContact) {
      return NextResponse.json(
        { error: 'Contato não encontrado' },
        { status: 404 }
      )
    }

    // Deletar contato
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar contato:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar contato' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Contato deletado com sucesso' })
  } catch (error) {
    console.error('Erro no endpoint DELETE /api/contacts/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
