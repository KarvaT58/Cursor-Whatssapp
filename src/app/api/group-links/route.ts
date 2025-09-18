import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/group-links - Listar links universais do usuário
export async function GET() {
  try {
    console.log('🔗 LISTANDO LINKS UNIVERSAIS ===')
    
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: groupLinks, error } = await supabase
      .from('group_links')
      .select(`
        *,
        group_families (
          name,
          base_name,
          total_participants,
          current_groups,
          whatsapp_groups (
            id,
            name,
            participants
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar links universais:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar links universais' },
        { status: 500 }
      )
    }

    // Processar dados para incluir estatísticas
        const processedLinks = groupLinks.map((link: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      ...link,
      family: link.group_families,
      stats: {
        totalGroups: link.group_families.whatsapp_groups.length,
        totalParticipants: link.group_families.total_participants,
        availableSpots: link.group_families.whatsapp_groups.reduce(
          (total: number, group: any) => total + (1024 - group.participants.length), // eslint-disable-line @typescript-eslint/no-explicit-any 
          0
        )
      }
    }))

    console.log('✅ Links universais listados com sucesso')
    return NextResponse.json({ success: true, data: processedLinks })

  } catch (error) {
    console.error('Erro na API de links universais:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
