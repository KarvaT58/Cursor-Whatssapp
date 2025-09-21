import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/groups/[id]/debug - Debug informações do grupo
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

    const { id: groupId } = await params

    console.log('🔍 DEBUG: Analisando grupo:', groupId)

    // 1. Buscar dados completos do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select(`
        *,
        group_families (
          id,
          name,
          base_name,
          current_groups,
          created_at,
          updated_at
        )
      `)
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError) {
      console.error('❌ Erro ao buscar grupo:', groupError)
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar links universais relacionados
    const { data: groupLinks, error: linksError } = await supabase
      .from('group_links')
      .select('*')
      .or(`group_family.eq.${group.group_family},universal_link.eq.${group.universal_link}`)
      .eq('user_id', user.id)

    // 3. Buscar outras famílias de grupos
    const { data: allFamilies, error: familiesError } = await supabase
      .from('group_families')
      .select('*')
      .eq('user_id', user.id)

    // 4. Buscar outros grupos da mesma família
    let familyGroups = []
    if (group.group_family) {
      const { data: familyGroupsData, error: familyGroupsError } = await supabase
        .from('whatsapp_groups')
        .select('id, name, whatsapp_id, group_family, universal_link')
        .eq('group_family', group.group_family)
        .eq('user_id', user.id)
      
      familyGroups = familyGroupsData || []
    }

    const debugInfo = {
      group: {
        id: group.id,
        name: group.name,
        whatsapp_id: group.whatsapp_id,
        group_family: group.group_family,
        universal_link: group.universal_link,
        participants: group.participants,
        created_at: group.created_at,
        updated_at: group.updated_at
      },
      group_families: group.group_families,
      group_links: groupLinks || [],
      all_families: allFamilies || [],
      family_groups: familyGroups,
      analysis: {
        is_universal: !!(group.group_family || group.universal_link),
        has_group_family: !!group.group_family,
        has_universal_link: !!group.universal_link,
        has_group_families_data: !!group.group_families,
        family_groups_count: familyGroups.length,
        related_links_count: (groupLinks || []).length
      }
    }

    console.log('📊 DEBUG INFO:', JSON.stringify(debugInfo, null, 2))

    return NextResponse.json({
      success: true,
      debug: debugInfo
    })

  } catch (error) {
    console.error('❌ Erro no debug do grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
