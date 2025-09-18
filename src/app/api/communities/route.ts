import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de criação de comunidade
const CreateCommunitySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  image_url: z.string().url('URL de imagem inválida').optional(),
  settings: z.object({
    allow_member_invites: z.boolean().default(true),
    require_admin_approval: z.boolean().default(true),
    max_groups: z.number().min(1).max(50).default(10),
    allow_announcements: z.boolean().default(true),
  }).optional(),
})

// Schema para validação de busca de comunidades
const SearchCommunitiesSchema = z.object({
  query: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  pageSize: z.string().transform(Number).default('10'),
  sortBy: z.enum(['name', 'created_at', 'updated_at', 'groups_count']).default('updated_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  is_active: z.string().transform(val => val === 'true').optional(),
  has_announcement_group: z.string().transform(val => val === 'true').optional(),
})

// POST /api/communities - Criar nova comunidade
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

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { name, description, image_url, settings } = CreateCommunitySchema.parse(body)

    // Verificar se já existe uma comunidade com o mesmo nome para o usuário
    const { data: existingCommunity, error: checkError } = await supabase
      .from('whatsapp_communities')
      .select('id')
      .eq('name', name)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (existingCommunity) {
      return NextResponse.json(
        { error: 'Já existe uma comunidade ativa com este nome' },
        { status: 400 }
      )
    }

    // Criar a comunidade
    const { data: newCommunity, error: createError } = await supabase
      .from('whatsapp_communities')
      .insert({
        name,
        description: description || null,
        image_url: image_url || null,
        whatsapp_community_id: null, // Será preenchido pela Z-API
        announcement_group_id: null, // Será criado posteriormente
        created_by: user.phone || user.email,
        user_id: user.id,
        is_active: true,
        settings: {
          allow_member_invites: settings?.allow_member_invites ?? true,
          require_admin_approval: settings?.require_admin_approval ?? true,
          max_groups: settings?.max_groups ?? 10,
          allow_announcements: settings?.allow_announcements ?? true,
        },
      })
      .select()
      .single()

    if (createError) {
      console.error('Erro ao criar comunidade:', createError)
      return NextResponse.json(
        { error: 'Erro ao criar comunidade' },
        { status: 500 }
      )
    }

    // Criar o membro fundador (owner)
    const { error: memberError } = await supabase
      .from('community_members')
      .insert({
        community_id: newCommunity.id,
        user_phone: user.phone || user.email,
        role: 'owner',
        joined_at: new Date().toISOString(),
        invited_by: null,
        is_active: true,
      })

    if (memberError) {
      console.error('Erro ao criar membro fundador:', memberError)
      // Não falhar a operação, apenas logar o erro
    }

    // TODO: Sincronizar com Z-API para criar a comunidade no WhatsApp
    try {
      // await createWhatsAppCommunity(newCommunity.id, name, description)
      console.log(`TODO: Criar comunidade ${newCommunity.id} no WhatsApp via Z-API`)
    } catch (zApiError) {
      console.error('Erro ao sincronizar com Z-API:', zApiError)
      // Não falhar a operação se a sincronização falhar
    }

    return NextResponse.json({
      message: 'Comunidade criada com sucesso',
      community: newCommunity,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de criação de comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/communities - Listar comunidades do usuário
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

    // Extrair parâmetros de busca
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    const { query, page, pageSize, sortBy, sortOrder, is_active, has_announcement_group } = SearchCommunitiesSchema.parse(queryParams)

    // Construir query base
    let dbQuery = supabase
      .from('whatsapp_communities')
      .select(`
        *,
        community_groups(count),
        community_members(count)
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Aplicar filtros
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (is_active !== undefined) {
      dbQuery = dbQuery.eq('is_active', is_active)
    }

    if (has_announcement_group !== undefined) {
      if (has_announcement_group) {
        dbQuery = dbQuery.not('announcement_group_id', 'is', null)
      } else {
        dbQuery = dbQuery.is('announcement_group_id', null)
      }
    }

    // Aplicar ordenação
    const { data: communities, error, count } = await dbQuery
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * pageSize, page * pageSize - 1)

    if (error) {
      console.error('Erro ao buscar comunidades:', error)
      return NextResponse.json({ error: 'Erro ao buscar comunidades' }, { status: 500 })
    }

    // Processar dados para incluir estatísticas
    const processedCommunities = communities?.map(community => ({
      ...community,
      stats: {
        groups_count: community.community_groups?.[0]?.count || 0,
        members_count: community.community_members?.[0]?.count || 0,
      },
    })) || []

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / pageSize)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      communities: processedCommunities,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro na API de busca de comunidades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
