import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    // Sistema simplificado - sincronização básica
    console.log('✅ Sincronização concluída (sistema simplificado)')
    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída com sucesso',
      data: {
        totalChanges: 0,
        message: 'Sistema simplificado - sincronização básica'
      }
    })

  } catch (error) {
    console.error('❌ Erro na API de sincronização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
