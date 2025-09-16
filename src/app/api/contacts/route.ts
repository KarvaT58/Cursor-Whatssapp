import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema de validação para contatos
const ContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Formato de telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notas muito longas').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
})

// const UpdateContactSchema = ContactSchema.partial() // Removido - não usado neste arquivo

// GET /api/contacts - Listar contatos
export async function GET(request: NextRequest) {
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

    // Buscar parâmetros de query
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Construir query
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    if (tags) {
      const tagArray = tags.split(',')
      query = query.contains('tags', tagArray)
    }

    // Aplicar paginação
    query = query.range(offset, offset + limit - 1)

    const { data: contacts, error, count } = await query

    if (error) {
      console.error('Erro ao buscar contatos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar contatos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      contacts: contacts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro no endpoint GET /api/contacts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contacts - Criar contato
export async function POST(request: NextRequest) {
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
    const validatedData = ContactSchema.parse(body)

    // Verificar se já existe contato com o mesmo telefone
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('user_id', user.id)
      .eq('phone', validatedData.phone)
      .single()

    if (existingContact) {
      return NextResponse.json(
        { error: 'Já existe um contato com este telefone' },
        { status: 400 }
      )
    }

    // Criar contato
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        ...validatedData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar contato:', error)
      return NextResponse.json(
        { error: 'Erro ao criar contato' },
        { status: 500 }
      )
    }

    return NextResponse.json({ contact }, { status: 201 })
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

    console.error('Erro no endpoint POST /api/contacts:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
