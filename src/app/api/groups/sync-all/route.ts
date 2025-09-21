import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GroupLinkSystem } from '@/lib/group-link-system'

// POST /api/groups/sync-all - Sincronizar todos os grupos do usuário
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

    console.log('🔄 SINCRONIZAÇÃO AUTOMÁTICA DE TODOS OS GRUPOS ===')
    console.log('User ID:', user.id)

    // Usar o GroupLinkSystem para sincronizar todos os grupos
    const groupLinkSystem = new GroupLinkSystem()
    const syncResult = await groupLinkSystem.autoSyncAllGroups(user.id)

    if (!syncResult.success) {
      console.error('❌ Erro na sincronização automática:', syncResult.error)
      return NextResponse.json(
        { error: syncResult.error || 'Erro na sincronização automática' },
        { status: 500 }
      )
    }

    console.log('✅ Sincronização automática concluída com sucesso')
    return NextResponse.json({
      success: true,
      message: 'Todos os grupos foram sincronizados com sucesso',
      data: syncResult.data
    })

  } catch (error) {
    console.error('❌ Erro na API de sincronização automática:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
