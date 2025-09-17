import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação dos parâmetros de busca
const SearchGroupsSchema = z.object({
  query: z.string().min(1, 'Termo de busca é obrigatório'),
  filters: z.object({
    name: z.string().optional(),
    participants: z.array(z.string()).optional(),
    description: z.string().optional(),
  }).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'created_at', 'updated_at']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// GET /api/groups/search - Buscar grupos com filtros
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

    // Extrair parâmetros da URL
    const { searchParams } = new URL(request.url)
    const params = {
      query: searchParams.get('query') || '',
      filters: {
        name: searchParams.get('name') || undefined,
        participants: searchParams.get('participants')?.split(',').filter(Boolean) || undefined,
        description: searchParams.get('description') || undefined,
      },
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc',
    }

    // Validar parâmetros
    const validatedParams = SearchGroupsSchema.parse(params)

    // Construir query base
    let query = supabase
      .from('whatsapp_groups')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Aplicar filtro de busca principal (busca em nome e descrição)
    if (validatedParams.query) {
      query = query.or(`name.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`)
    }

    // Aplicar filtros específicos
    if (validatedParams.filters?.name) {
      query = query.ilike('name', `%${validatedParams.filters.name}%`)
    }

    if (validatedParams.filters?.description) {
      query = query.ilike('description', `%${validatedParams.filters.description}%`)
    }

    // Filtro por participantes (busca se o telefone está no array de participantes)
    if (validatedParams.filters?.participants && validatedParams.filters.participants.length > 0) {
      const participantFilters = validatedParams.filters.participants
        .map(phone => `participants.cs.{${phone}}`)
        .join(',')
      query = query.or(participantFilters)
    }

    // Aplicar ordenação
    query = query.order(validatedParams.sortBy, { 
      ascending: validatedParams.sortOrder === 'asc' 
    })

    // Aplicar paginação
    const offset = (validatedParams.page - 1) * validatedParams.limit
    query = query.range(offset, offset + validatedParams.limit - 1)

    // Executar query
    const { data: groups, error, count } = await query

    if (error) {
      console.error('Erro ao buscar grupos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos' },
        { status: 500 }
      )
    }

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / validatedParams.limit)
    const hasNextPage = validatedParams.page < totalPages
    const hasPreviousPage = validatedParams.page > 1

    return NextResponse.json({
      groups: groups || [],
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        query: validatedParams.query,
        appliedFilters: validatedParams.filters,
      },
      sort: {
        by: validatedParams.sortBy,
        order: validatedParams.sortOrder,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Parâmetros inválidos', 
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de busca de grupos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
