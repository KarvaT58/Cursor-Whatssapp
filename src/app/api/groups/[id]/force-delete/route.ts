import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GroupLinkSystem } from '@/lib/group-link-system'

export async function DELETE(
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

    const { id } = await params

    console.log('🗑️ FORÇANDO EXCLUSÃO DO GRUPO:', id)

    // 1. Verificar se é um grupo universal
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('id, name, group_family, universal_link')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (groupError) {
      console.error('Erro ao buscar grupo:', groupError)
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    const isUniversalGroup = !!(group.group_family || group.universal_link)
    
    console.log('🔍 DADOS DO GRUPO:', {
      id: group.id,
      name: group.name,
      isUniversal: isUniversalGroup,
      hasGroupFamily: !!group.group_family,
      hasUniversalLink: !!group.universal_link,
      group_family: group.group_family
    })

    if (isUniversalGroup) {
      // Usar método específico para grupos universais
      console.log('🔗 Excluindo grupo universal...')
      const groupLinkSystem = new GroupLinkSystem()
      const deleteResult = await groupLinkSystem.deleteUniversalGroup(id, user.id)
      
      if (!deleteResult.success) {
        console.error('❌ Erro na exclusão do grupo universal:', deleteResult.error)
        return NextResponse.json(
          { error: deleteResult.error || 'Erro ao excluir grupo universal' },
          { status: 500 }
        )
      }

      console.log('✅ Grupo universal excluído com sucesso!')
      return NextResponse.json({
        success: true,
        message: 'Grupo universal excluído com sucesso',
        data: {
          groupId: id,
          groupName: group.name,
          deletedAt: new Date().toISOString()
        }
      })
    } else {
      // Exclusão normal
      console.log('🗑️ Excluindo grupo normal...')
      const { error: deleteError } = await supabase
        .from('whatsapp_groups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('❌ Erro ao excluir grupo:', deleteError)
        return NextResponse.json(
          { error: 'Erro ao excluir grupo' },
          { status: 500 }
        )
      }

      console.log('✅ Grupo normal excluído com sucesso!')
      return NextResponse.json({
        success: true,
        message: 'Grupo excluído com sucesso',
        data: {
          groupId: id,
          groupName: group.name,
          deletedAt: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('❌ Erro geral na exclusão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
