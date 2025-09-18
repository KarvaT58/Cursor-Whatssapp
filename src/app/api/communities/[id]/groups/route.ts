import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de adição de grupo
const AddGroupSchema = z.object({
  group_id: z.string().min(1, 'ID do grupo é obrigatório'),
  is_announcement_group: z.boolean().default(false),
})

// POST /api/communities/[id]/groups - Adicionar grupo à comunidade
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const communityId = params.id
    if (!communityId) {
      return NextResponse.json({ error: 'ID da comunidade é obrigatório' }, { status: 400 })
    }

    // Validar dados do corpo da requisição
    const body = await request.json()
    const { group_id, is_announcement_group } = AddGroupSchema.parse(body)

    // Verificar se a comunidade existe e pertence ao usuário
    const { data: community, error: communityError } = await supabase
      .from('whatsapp_communities')
      .select('*')
      .eq('id', communityId)
      .eq('user_id', user.id)
      .single()

    if (communityError || !community) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', group_id)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o grupo já está vinculado à comunidade
    const { data: existingLink, error: linkError } = await supabase
      .from('community_groups')
      .select('id')
      .eq('community_id', communityId)
      .eq('group_id', group_id)
      .single()

    if (existingLink) {
      return NextResponse.json(
        { error: 'Grupo já está vinculado a esta comunidade' },
        { status: 400 }
      )
    }

    // Verificar limite de grupos da comunidade
    const { data: currentGroups, error: countError } = await supabase
      .from('community_groups')
      .select('id', { count: 'exact' })
      .eq('community_id', communityId)

    const maxGroups = community.settings?.max_groups || 10
    if ((currentGroups?.length || 0) >= maxGroups) {
      return NextResponse.json(
        { error: `Comunidade atingiu o limite máximo de ${maxGroups} grupos` },
        { status: 400 }
      )
    }

    // Se for grupo de anúncios, verificar se já existe um
    if (is_announcement_group) {
      const { data: existingAnnouncement, error: announcementError } = await supabase
        .from('community_groups')
        .select('id')
        .eq('community_id', communityId)
        .eq('is_announcement_group', true)
        .single()

      if (existingAnnouncement) {
        return NextResponse.json(
          { error: 'Já existe um grupo de anúncios nesta comunidade' },
          { status: 400 }
        )
      }
    }

    // Adicionar o grupo à comunidade
    const { data: newLink, error: addError } = await supabase
      .from('community_groups')
      .insert({
        community_id: communityId,
        group_id: group_id,
        added_by: user.phone || user.email,
        added_at: new Date().toISOString(),
        is_announcement_group: is_announcement_group,
      })
      .select()
      .single()

    if (addError) {
      console.error('Erro ao adicionar grupo à comunidade:', addError)
      return NextResponse.json(
        { error: 'Erro ao adicionar grupo à comunidade' },
        { status: 500 }
      )
    }

    // Se for grupo de anúncios, atualizar a comunidade
    if (is_announcement_group) {
      const { error: updateError } = await supabase
        .from('whatsapp_communities')
        .update({
          announcement_group_id: group_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', communityId)

      if (updateError) {
        console.error('Erro ao atualizar grupo de anúncios:', updateError)
        // Não falhar a operação, apenas logar o erro
      }
    }

    // TODO: Sincronizar com Z-API se whatsapp_community_id estiver presente
    if (community.whatsapp_community_id && group.whatsapp_id) {
      try {
        // await addGroupToWhatsAppCommunity(community.whatsapp_community_id, group.whatsapp_id)
        console.log(`TODO: Adicionar grupo ${group.whatsapp_id} à comunidade ${community.whatsapp_community_id} via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Grupo adicionado à comunidade com sucesso',
      link: newLink,
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        is_announcement_group: is_announcement_group,
      },
      community: {
        id: community.id,
        name: community.name,
        groups_count: (currentGroups?.length || 0) + 1,
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

    console.error('Erro na API de adição de grupo à comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET /api/communities/[id]/groups - Listar grupos da comunidade
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const communityId = params.id
    if (!communityId) {
      return NextResponse.json({ error: 'ID da comunidade é obrigatório' }, { status: 400 })
    }

    // Verificar se a comunidade existe e pertence ao usuário
    const { data: community, error: communityError } = await supabase
      .from('whatsapp_communities')
      .select('*')
      .eq('id', communityId)
      .eq('user_id', user.id)
      .single()

    if (communityError || !community) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      )
    }

    // Buscar grupos da comunidade
    const { data: communityGroups, error: groupsError } = await supabase
      .from('community_groups')
      .select(`
        *,
        whatsapp_groups (
          id,
          name,
          description,
          participants,
          admins,
          whatsapp_id,
          created_at,
          updated_at
        )
      `)
      .eq('community_id', communityId)
      .order('added_at', { ascending: false })

    if (groupsError) {
      console.error('Erro ao buscar grupos da comunidade:', groupsError)
      return NextResponse.json(
        { error: 'Erro ao buscar grupos da comunidade' },
        { status: 500 }
      )
    }

    // Processar dados
    const processedGroups = communityGroups?.map(link => ({
      id: link.id,
      community_id: link.community_id,
      group_id: link.group_id,
      added_by: link.added_by,
      added_at: link.added_at,
      is_announcement_group: link.is_announcement_group,
      group: link.whatsapp_groups,
    })) || []

    return NextResponse.json({
      community: {
        id: community.id,
        name: community.name,
        max_groups: community.settings?.max_groups || 10,
      },
      groups: processedGroups,
      total_groups: processedGroups.length,
      announcement_groups: processedGroups.filter(g => g.is_announcement_group).length,
    })
  } catch (error) {
    console.error('Erro na API de listagem de grupos da comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
