import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/blacklist/[id] - Remover número da blacklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🚫 REMOVENDO NÚMERO DA BLACKLIST ===')
    
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const blacklistId = resolvedParams.id
    console.log('Blacklist ID:', blacklistId)

    if (!blacklistId) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    // Verificar se o item pertence ao usuário
    const { data: existingEntry, error: fetchError } = await supabase
      .from('blacklist')
      .select('id, phone')
      .eq('id', blacklistId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json(
        { error: 'Item não encontrado ou não pertence ao usuário' },
        { status: 404 }
      )
    }

    // Remover da blacklist
    const { error: deleteError } = await supabase
      .from('blacklist')
      .delete()
      .eq('id', blacklistId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Erro ao remover da blacklist:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao remover da blacklist' },
        { status: 500 }
      )
    }

    console.log('✅ Número removido da blacklist com sucesso:', existingEntry.phone)
    return NextResponse.json({
      success: true,
      message: 'Número removido da blacklist com sucesso',
      data: { phone: existingEntry.phone }
    })

  } catch (error) {
    console.error('Erro na API de remoção da blacklist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
