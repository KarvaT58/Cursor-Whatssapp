import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Instância global do monitor (singleton)
let groupMonitor: GroupMonitor | null = null

// Função para verificar e recuperar o monitor se necessário
async function checkAndRecoverMonitor() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Buscar estado do monitor no banco
    const { data: monitorState, error: stateError } = await supabase
      .from('monitor_state')
      .select('*')
      .eq('id', 'group_monitor')
      .single()

    if (stateError && stateError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar estado do monitor:', stateError)
      return
    }

    // Se não há estado no banco, não há nada para recuperar
    if (!monitorState) {
      return
    }

    const now = Date.now()
    const lastCheckTime = monitorState.last_check_time ? new Date(monitorState.last_check_time).getTime() : 0
    const timeSinceLastCheck = now - lastCheckTime
    const isStale = timeSinceLastCheck > (monitorState.check_interval || 30000) * 2

    // Se o monitor deveria estar rodando mas está stale ou com muitos erros
    if (monitorState.is_running && (isStale || monitorState.consecutive_errors >= 3)) {
      console.log('🔄 Monitor detectado como inativo, tentando recuperar...')
      
      // Criar novo monitor com as configurações salvas
      if (groupMonitor) {
        groupMonitor.stop()
      }
      
      groupMonitor = new GroupMonitor({
        checkInterval: monitorState.check_interval || 30000,
        adminPhone: monitorState.admin_phone || '(45) 91284-3589'
      })
      
      groupMonitor.start()
      console.log('✅ Monitor recuperado com sucesso')
    }
  } catch (error) {
    console.error('❌ Erro ao verificar recuperação do monitor:', error)
  }
}

// GET /api/monitoring/group-monitor - Status do sistema simples
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        isRunning: true,
        message: 'Sistema SIMPLES ativo - Verificação via webhook Z-API',
        system: 'simple_blacklist_checker',
        description: 'Sistema simplificado que verifica blacklist apenas via webhook'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao obter status:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter status'
    }, { status: 500 })
  }
}

// POST /api/monitoring/group-monitor - Sistema simples não precisa de controle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    return NextResponse.json({
      success: true,
      data: {
        message: 'Sistema SIMPLES sempre ativo - Verificação automática via webhook Z-API',
        system: 'simple_blacklist_checker',
        description: 'Não precisa iniciar/parar - funciona automaticamente quando alguém entra no grupo'
      }
    })

  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro'
    }, { status: 500 })
  }
}
