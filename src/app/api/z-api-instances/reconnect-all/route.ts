import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

// POST /api/z-api-instances/reconnect-all - Reconectar todas as instâncias
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

    console.log('🔄 RECONECTANDO TODAS AS INSTÂNCIAS Z-API ===')
    console.log('User ID:', user.id)

    // Buscar todas as instâncias do usuário
    const { data: instances, error: instancesError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (instancesError) {
      console.error('❌ Erro ao buscar instâncias:', instancesError)
      return NextResponse.json(
        { error: 'Erro ao buscar instâncias' },
        { status: 500 }
      )
    }

    if (!instances || instances.length === 0) {
      console.log('ℹ️ Nenhuma instância encontrada')
      return NextResponse.json({
        success: true,
        message: 'Nenhuma instância encontrada',
        data: { reconnected: 0, total: 0 }
      })
    }

    console.log(`📋 Encontradas ${instances.length} instâncias para reconectar`)

    const results = []
    let successCount = 0

    // Reconectar cada instância
    for (const instance of instances) {
      console.log(`🔄 Reconectando instância: ${instance.name} (${instance.instance_id})`)
      
      try {
        const zApiClient = new ZApiClient(
          instance.instance_id,
          instance.instance_token,
          instance.client_token
        )

        // Tentar reconectar
        const reconnectResult = await zApiClient.connect()

        if (reconnectResult.success) {
          console.log(`✅ Instância ${instance.name} reconectada com sucesso`)
          successCount++
          
          results.push({
            instanceId: instance.id,
            instanceName: instance.name,
            success: true,
            message: 'Reconectada com sucesso'
          })
        } else {
          console.error(`❌ Falha ao reconectar ${instance.name}:`, reconnectResult.error)
          
          results.push({
            instanceId: instance.id,
            instanceName: instance.name,
            success: false,
            error: reconnectResult.error
          })
        }
      } catch (error: any) {
        console.error(`❌ Erro ao reconectar ${instance.name}:`, error)
        
        results.push({
          instanceId: instance.id,
          instanceName: instance.name,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`✅ Reconexão concluída: ${successCount}/${instances.length} instâncias reconectadas`)

    return NextResponse.json({
      success: true,
      message: `Reconexão concluída: ${successCount}/${instances.length} instâncias reconectadas`,
      data: {
        total: instances.length,
        reconnected: successCount,
        results
      }
    })

  } catch (error) {
    console.error('❌ Erro na reconexão de instâncias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
