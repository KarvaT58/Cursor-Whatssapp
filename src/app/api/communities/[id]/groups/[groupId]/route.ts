import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/communities/[id]/groups/[groupId] - Remover grupo da comunidade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; groupId: string } }
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
    const groupId = params.groupId

    if (!communityId || !groupId) {
      return NextResponse.json({ error: 'IDs da comunidade e grupo são obrigatórios' }, { status: 400 })
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

    // Verificar se o grupo está vinculado à comunidade
    const { data: communityGroup, error: linkError } = await supabase
      .from('community_groups')
      .select('*')
      .eq('community_id', communityId)
      .eq('group_id', groupId)
      .single()

    if (linkError || !communityGroup) {
      return NextResponse.json(
        { error: 'Grupo não está vinculado a esta comunidade' },
        { status: 404 }
      )
    }

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // Remover o grupo da comunidade
    const { error: removeError } = await supabase
      .from('community_groups')
      .delete()
      .eq('community_id', communityId)
      .eq('group_id', groupId)

    if (removeError) {
      console.error('Erro ao remover grupo da comunidade:', removeError)
      return NextResponse.json(
        { error: 'Erro ao remover grupo da comunidade' },
        { status: 500 }
      )
    }

    // Se era o grupo de anúncios, limpar a referência na comunidade
    if (communityGroup.is_announcement_group) {
      const { error: updateError } = await supabase
        .from('whatsapp_communities')
        .update({
          announcement_group_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', communityId)

      if (updateError) {
        console.error('Erro ao limpar grupo de anúncios:', updateError)
        // Não falhar a operação, apenas logar o erro
      }
    }

    // TODO: Sincronizar com Z-API se whatsapp_community_id estiver presente
    if (community.whatsapp_community_id && group.whatsapp_id) {
      try {
        // await removeGroupFromWhatsAppCommunity(community.whatsapp_community_id, group.whatsapp_id)
        console.log(`TODO: Remover grupo ${group.whatsapp_id} da comunidade ${community.whatsapp_community_id} via Z-API`)
      } catch (zApiError) {
        console.error('Erro ao sincronizar com Z-API:', zApiError)
        // Não falhar a operação se a sincronização falhar
      }
    }

    return NextResponse.json({
      message: 'Grupo removido da comunidade com sucesso',
      group: {
        id: group.id,
        name: group.name,
        was_announcement_group: communityGroup.is_announcement_group,
      },
      community: {
        id: community.id,
        name: community.name,
      },
    })
  } catch (error) {
    console.error('Erro na API de remoção de grupo da comunidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
