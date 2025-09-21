import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

// POST /api/z-api-instances/[id]/reconnect - Reconectar instância Z-API
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

    const { id: instanceId } = await params

    // Buscar instância
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', instanceId)
      .eq('user_id', user.id)
      .single()

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    console.log('🔄 Tentando reconectar instância:', instance.name)

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Tentar reconectar
    const reconnectResult = await zApiClient.connect()

    if (!reconnectResult.success) {
      console.error('❌ Erro ao reconectar:', reconnectResult.error)
      return NextResponse.json({
        success: false,
        error: reconnectResult.error,
        message: 'Falha ao reconectar. Verifique se o WhatsApp está ativo no celular.'
      })
    }

    console.log('✅ Instância reconectada com sucesso')

    // Atualizar status no banco
    const { error: updateError } = await supabase
      .from('z_api_instances')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', instanceId)

    if (updateError) {
      console.error('❌ Erro ao atualizar status no banco:', updateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Instância reconectada com sucesso!',
      data: reconnectResult.data
    })

  } catch (error) {
    console.error('❌ Erro ao reconectar instância:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
