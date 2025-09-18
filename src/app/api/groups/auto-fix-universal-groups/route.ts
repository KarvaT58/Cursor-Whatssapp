import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    console.log('🔧 Iniciando correção automática de grupos universais...')
    
    // Buscar todos os grupos que têm group_family mas não têm universal_link
    const { data: groupsToFix, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select(`
        id,
        name,
        group_family,
        universal_link,
        group_families (
          id,
          base_name,
          group_links (
            universal_link
          )
        )
      `)
      .not('group_family', 'is', null)
      .is('universal_link', null)

    if (groupsError) {
      console.error('❌ Erro ao buscar grupos para corrigir:', groupsError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar grupos para corrigir'
      }, { status: 500 })
    }

    if (!groupsToFix || groupsToFix.length === 0) {
      console.log('✅ Nenhum grupo precisa de correção')
      return NextResponse.json({
        success: true,
        message: 'Todos os grupos já estão corretos',
        fixedCount: 0
      })
    }

    console.log(`🔧 Encontrados ${groupsToFix.length} grupos para corrigir`)

    let fixedCount = 0
    const results = []

    for (const group of groupsToFix) {
      console.log(`🔧 Corrigindo grupo: ${group.name}`)
      
      const familyLink = group.group_families?.group_links?.[0]?.universal_link
      
      if (!familyLink) {
        console.warn(`⚠️ Família ${group.group_families?.base_name} não tem link universal`)
        results.push({
          group: group.name,
          success: false,
          error: 'Família não tem link universal'
        })
        continue
      }

      // Atualizar o grupo com o link universal
      const { error: updateError } = await supabase
        .from('whatsapp_groups')
        .update({ universal_link: familyLink })
        .eq('id', group.id)

      if (updateError) {
        console.error(`❌ Erro ao atualizar grupo ${group.name}:`, updateError)
        results.push({
          group: group.name,
          success: false,
          error: updateError.message
        })
      } else {
        fixedCount++
        results.push({
          group: group.name,
          success: true,
          link: familyLink
        })
        console.log(`✅ Grupo ${group.name} corrigido automaticamente`)
      }
    }

    console.log(`✅ Correção automática concluída! ${fixedCount} grupos corrigidos`)

    return NextResponse.json({
      success: true,
      message: `Correção automática concluída! ${fixedCount} grupos foram corrigidos.`,
      fixedCount,
      results
    })

  } catch (error) {
    console.error('❌ Erro na correção automática:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
