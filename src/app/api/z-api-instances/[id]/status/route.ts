import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

// GET /api/z-api-instances/[id]/status - Verificar status da instância Z-API
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

    console.log('🔍 Verificando status da instância:', instance.name)

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Verificar status da instância
    const statusResult = await zApiClient.getInstanceInfo()

    if (!statusResult.success) {
      console.error('❌ Erro ao verificar status:', statusResult.error)
      return NextResponse.json({
        success: false,
        error: statusResult.error,
        instance: {
          id: instance.id,
          name: instance.name,
          instance_id: instance.instance_id,
          is_active: false,
          status: 'disconnected'
        }
      })
    }

    console.log('✅ Instância está conectada:', statusResult.data)

    return NextResponse.json({
      success: true,
      instance: {
        id: instance.id,
        name: instance.name,
        instance_id: instance.instance_id,
        is_active: true,
        status: 'connected',
        data: statusResult.data
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar status da instância:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
