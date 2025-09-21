import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ZApiClient } from '@/lib/z-api/client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Buscar todas as instâncias ativas
    const { data: instances, error } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('active', true)

    if (error) {
      console.error('❌ Erro ao buscar instâncias:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar instâncias', details: error.message },
        { status: 500 }
      )
    }

    if (!instances || instances.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma instância ativa encontrada',
        instances: []
      })
    }

    // Testar conectividade de cada instância
    const testResults = await Promise.all(
      instances.map(async (instance) => {
        try {
          const zApiClient = new ZApiClient(
            instance.instance_id,
            instance.instance_token,
            instance.client_token
          )

          // Testar com uma operação simples
          const statusResult = await zApiClient.getInstanceStatus()
          
          return {
            id: instance.id,
            instance_id: instance.instance_id,
            name: instance.name,
            status: 'connected',
            details: statusResult,
            last_check: new Date().toISOString()
          }
        } catch (error) {
          console.error(`❌ Erro ao testar instância ${instance.instance_id}:`, error)
          
          return {
            id: instance.id,
            instance_id: instance.instance_id,
            name: instance.name,
            status: 'disconnected',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            last_check: new Date().toISOString()
          }
        }
      })
    )

    const connectedCount = testResults.filter(i => i.status === 'connected').length
    const disconnectedCount = testResults.filter(i => i.status === 'disconnected').length

    return NextResponse.json({
      success: true,
      message: `Teste de conectividade: ${connectedCount} conectadas, ${disconnectedCount} desconectadas`,
      summary: {
        total: instances.length,
        connected: connectedCount,
        disconnected: disconnectedCount
      },
      instances: testResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erro geral no teste de conectividade:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    )
  }
}
