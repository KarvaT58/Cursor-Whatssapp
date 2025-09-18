import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema para validação de atualização de comunidade
const UpdateCommunitySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo').optional(),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  image_url: z.string().url('URL de imagem inválida').optional(),
  settings: z.object({
    allow_member_invites: z.boolean().optional(),
    require_admin_approval: z.boolean().optional(),
    max_groups: z.number().min(1).max(50).optional(),
    allow_announcements: z.boolean().optional(),
  }).optional(),
  is_active: z.boolean().optional(),
})

// GET /api/communities/[id] - Obter detalhes de uma comunidade
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

    // Buscar a comunidade
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
          whatsapp_id
        )
      `)
      .eq('community_id', communityId)

    if (groupsError) {
      console.error('Erro ao buscar grupos da comunidade:', groupsError)
    }

    // Buscar membros da comunidade
    const { data: communityMembers, error: membersError } = await supabase
      .from('community_members')
      .select('*')
      .eq('community_id', communityId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false })

    if (membersError) {
      console.error('Erro ao buscar membros da comunidade:', membersError)
    }

    // Calcular estatísticas
    const stats = {
      total_groups: communityGroups?.length || 0,
      total_members: communityMembers?.length || 0,
      active_members: communityMembers?.filter(m => m.is_active).length || 0,
      announcement_groups: communityGroups?.filter(g => g.is_announcement_group).length || 0,
    }

    return NextResponse.json({
      community,
      groups: communityGroups || [],
      members: communityMembers || [],
      stats,
    })
  } catch (error) {
    console.error('Erro na API de detalhes da comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/communities/[id] - Atualizar comunidade
export async function PUT(
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
    const updateData = UpdateCommunitySchema.parse(body)

    // Verificar se a comunidade existe e pertence ao usuário
    const { data: existingCommunity, error: fetchError } = await supabase
      .from('whatsapp_communities')
      .select('*')
      .eq('id', communityId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCommunity) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o nome já existe (se estiver sendo alterado)
    if (updateData.name && updateData.name !== existingCommunity.name) {
      const { data: nameConflict, error: nameError } = await supabase
        .from('whatsapp_communities')
        .select('id')
        .eq('name', updateData.name)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .neq('id', communityId)
        .single()

      if (nameConflict) {
        return NextResponse.json(
          { error: 'Já existe uma comunidade ativa com este nome' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização
    const updateFields: any = {
      updated_at: new Date().toISOString(),
    }

    if (updateData.name) updateFields.name = updateData.name
    if (updateData.description !== undefined) updateFields.description = updateData.description
    if (updateData.image_url !== undefined) updateFields.image_url = updateData.image_url
    if (updateData.is_active !== undefined) updateFields.is_active = updateData.is_active

    if (updateData.settings) {
      updateFields.settings = {
        ...existingCommunity.settings,
        ...updateData.settings,
      }
    }

    // Atualizar a comunidade
    const { data: updatedCommunity, error: updateError } = await supabase
      .from('whatsapp_communities')
      .update(updateFields)
      .eq('id', communityId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar comunidade:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar comunidade' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_community_id estiver presente
    if (existingCommunity.whatsapp_community_id) {
      try {
        // await updateWhatsAppCommunity(existingCommunity.whatsapp_community_id, updateData)
        console.log(`TODO: Atualizar comunidade ${existingCommunity.whatsapp_community_id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Comunidade atualizada com sucesso',
      community: updatedCommunity,
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

    console.error('Erro na API de atualização de comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/communities/[id] - Desativar comunidade
export async function DELETE(
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
    const { data: existingCommunity, error: fetchError } = await supabase
      .from('whatsapp_communities')
      .select('*')
      .eq('id', communityId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingCommunity) {
      return NextResponse.json(
        { error: 'Comunidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é o owner da comunidade
    const { data: ownerCheck, error: ownerError } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_phone', user.phone || user.email)
      .eq('role', 'owner')
      .single()

    if (ownerError || !ownerCheck) {
      return NextResponse.json(
        { error: 'Apenas o proprietário pode desativar a comunidade' },
        { status: 403 }
      )
    }

    // Desativar a comunidade (soft delete)
    const { data: deactivatedCommunity, error: deactivateError } = await supabase
      .from('whatsapp_communities')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', communityId)
      .select()
      .single()

    if (deactivateError) {
      console.error('Erro ao desativar comunidade:', deactivateError)
      return NextResponse.json(
        { error: 'Erro ao desativar comunidade' },
        { status: 500 }
      )
    }

    // TODO: Sincronizar com Z-API se whatsapp_community_id estiver presente
    if (existingCommunity.whatsapp_community_id) {
      try {
        // await deleteWhatsAppCommunity(existingCommunity.whatsapp_community_id)
        console.log(`TODO: Desativar comunidade ${existingCommunity.whatsapp_community_id} no WhatsApp via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Comunidade desativada com sucesso',
      community: deactivatedCommunity,
    })
  } catch (error) {
    console.error('Erro na API de desativação de comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
