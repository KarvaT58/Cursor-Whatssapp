import { NextRequest, NextResponse } from 'next/server'
import { GroupMonitor } from '@/lib/monitoring/group-monitor'
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

// GET /api/monitoring/group-monitor - Status do monitor
export async function GET(request: NextRequest) {
  try {
    // Verificar se o monitor precisa ser recuperado
    await checkAndRecoverMonitor()

    if (!groupMonitor) {
      return NextResponse.json({
        success: true,
        data: {
          isRunning: false,
          message: 'Monitor não foi inicializado'
        }
      })
    }

    const status = groupMonitor.getStatus()
    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('❌ Erro ao obter status do monitor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter status do monitor'
    }, { status: 500 })
  }
}

// POST /api/monitoring/group-monitor - Iniciar/Parar monitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, adminPhone, checkInterval } = body

    if (action === 'start') {
      // Parar monitor existente se estiver rodando
      if (groupMonitor) {
        groupMonitor.stop()
      }

      // Criar novo monitor com configurações
      groupMonitor = new GroupMonitor({
        checkInterval: checkInterval || 30000, // 30 segundos por padrão
        adminPhone: adminPhone || '(45) 91284-3589'
      })

      // Iniciar monitoramento
      groupMonitor.start()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Monitor iniciado com sucesso',
          config: {
            checkInterval: checkInterval || 30000,
            adminPhone: adminPhone || '(45) 91284-3589'
          }
        }
      })

    } else if (action === 'stop') {
      if (groupMonitor) {
        groupMonitor.stop()
        groupMonitor = null

        return NextResponse.json({
          success: true,
          data: {
            message: 'Monitor parado com sucesso'
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Monitor não está rodando'
        }, { status: 400 })
      }

    } else {
      return NextResponse.json({
        success: false,
        error: 'Ação inválida. Use "start" ou "stop"'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Erro ao controlar monitor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao controlar monitor'
    }, { status: 500 })
  }
}
