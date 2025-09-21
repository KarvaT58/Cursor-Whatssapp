import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GroupLinkSystem } from '@/lib/group-link-system'

// POST /api/groups/[id]/sync-participants - Sincronizar participantes de um grupo
export async function POST(
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

    console.log('🔄 SINCRONIZAÇÃO MANUAL DE PARTICIPANTES ===')
    console.log('Group ID:', groupId)
    console.log('User ID:', user.id)

    // Usar o GroupLinkSystem para sincronizar
    const groupLinkSystem = new GroupLinkSystem()
    const syncResult = await groupLinkSystem.syncGroupParticipants(groupId, user.id)

    if (!syncResult.success) {
      console.error('❌ Erro na sincronização:', syncResult.error)
      return NextResponse.json(
        { error: syncResult.error || 'Erro na sincronização' },
        { status: 500 }
      )
    }

    console.log('✅ Sincronização concluída com sucesso')
    return NextResponse.json({
      success: true,
      message: 'Participantes sincronizados com sucesso',
      data: syncResult.data
    })

  } catch (error) {
    console.error('❌ Erro na API de sincronização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
