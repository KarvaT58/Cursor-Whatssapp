import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    
    console.log('🚪 API: Iniciando processo de saída do grupo:', { groupId })

    // Verificar autenticação
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Erro de autenticação:', authError)
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar o grupo no banco de dados
    console.log('🔍 Buscando grupo no banco:', {
      groupId,
      userId: user.id,
      userEmail: user.email
    })

    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', {
        groupId,
        userId: user.id,
        error: groupError,
        errorCode: groupError?.code,
        errorMessage: groupError?.message
      })

      // Tentar buscar sem filtro de user_id para debug
      console.log('🔍 Tentando buscar grupo sem filtro de user_id para debug...')
      const { data: groupDebug, error: groupDebugError } = await supabase
        .from('whatsapp_groups')
        .select('id, name, user_id, whatsapp_id')
        .eq('id', groupId)
        .single()

      if (groupDebug) {
        console.log('🔍 Grupo encontrado sem filtro de user_id:', {
          id: groupDebug.id,
          name: groupDebug.name,
          user_id: groupDebug.user_id,
          whatsapp_id: groupDebug.whatsapp_id,
          requestedUserId: user.id
        })
        
        if (groupDebug.user_id !== user.id) {
          console.error('❌ Grupo pertence a outro usuário:', {
            groupUserId: groupDebug.user_id,
            requestedUserId: user.id
          })
          return NextResponse.json(
            { success: false, error: 'Você não tem permissão para sair deste grupo' },
            { status: 403 }
          )
        }
      } else {
        console.error('❌ Grupo não existe no banco de dados:', {
          groupId,
          debugError: groupDebugError
        })
      }

      return NextResponse.json(
        { success: false, error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

    console.log('📋 Grupo encontrado:', { 
      id: group.id, 
      name: group.name, 
      whatsapp_id: group.whatsapp_id 
    })

    // Buscar instância ativa da Z-API
    const { data: userInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (instanceError || !userInstance) {
      console.error('❌ Instância Z-API não encontrada:', instanceError)
      return NextResponse.json(
        { success: false, error: 'Instância Z-API não configurada' },
        { status: 400 }
      )
    }

    console.log('🔧 Instância Z-API encontrada:', { 
      instance_id: userInstance.instance_id,
      is_active: userInstance.is_active 
    })

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      userInstance.instance_id,
      userInstance.instance_token,
      userInstance.client_token || ''
    )

    // Sair do grupo via Z-API
    console.log('📤 Enviando comando para sair do grupo via Z-API...')
    const leaveResult = await zApiClient.leaveGroup(group.whatsapp_id)

    if (!leaveResult.success) {
      console.error('❌ Erro ao sair do grupo via Z-API:', leaveResult.error)
      return NextResponse.json(
        { 
          success: false, 
          error: `Erro ao sair do grupo: ${leaveResult.error}` 
        },
        { status: 400 }
      )
    }

    console.log('✅ Sucesso ao sair do grupo via Z-API:', leaveResult.data)

    // Remover o grupo do banco de dados
    console.log('🗑️ Removendo grupo do banco de dados...')
    const { error: deleteError } = await supabase
      .from('whatsapp_groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('❌ Erro ao remover grupo do banco:', deleteError)
      // Não retornamos erro aqui, pois o usuário já saiu do grupo no WhatsApp
      console.warn('⚠️ Grupo removido do WhatsApp, mas erro ao remover do banco de dados')
    } else {
      console.log('✅ Grupo removido do banco de dados com sucesso')
    }

    return NextResponse.json({
      success: true,
      message: `Você saiu do grupo "${group.name}" com sucesso`,
      data: {
        groupId: group.id,
        groupName: group.name,
        whatsappId: group.whatsapp_id
      }
    })

  } catch (error: any) {
    console.error('❌ Erro interno ao sair do grupo:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}