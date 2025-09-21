import { NextRequest, NextResponse } from 'next/server'
import { GroupMonitor } from '@/lib/monitoring/group-monitor'
import { getMonitorWatchdog } from '@/lib/monitoring/monitor-watchdog'
import { ensureWatchdogRunning } from '@/lib/monitoring/auto-start'
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
    // Garantir que o watchdog está rodando
    ensureWatchdogRunning()
    
    // Obter watchdog (que garante que o monitor está sempre rodando)
    const watchdog = getMonitorWatchdog()

    // Obter status do monitor atual
    const watchdogStatus = watchdog.getStatus()
    const monitorStatus = watchdogStatus.monitorStatus

    return NextResponse.json({
      success: true,
      data: {
        ...monitorStatus,
        watchdog: {
          isRunning: watchdogStatus.isRunning,
          restartAttempts: watchdogStatus.restartAttempts,
          lastHealthCheck: watchdogStatus.lastHealthCheck,
          isHealthy: watchdogStatus.isHealthy
        },
        message: watchdogStatus.isRunning ? 'Monitor protegido por watchdog - NUNCA para sozinho!' : 'Watchdog não está rodando'
      }
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

    // Obter watchdog
    const watchdog = getMonitorWatchdog()

    if (action === 'start') {
      // Salvar configurações no banco
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const config = {
        checkInterval: checkInterval || 30000,
        adminPhone: adminPhone || '(45) 91284-3589'
      }

      await supabase
        .from('monitor_state')
        .upsert({
          id: 'group_monitor',
          check_interval: config.checkInterval,
          admin_phone: config.adminPhone,
          is_running: true,
          updated_at: new Date().toISOString()
        })

      // Iniciar watchdog (que garante que o monitor nunca para)
      watchdog.start()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Monitor iniciado com proteção watchdog - NUNCA para sozinho!',
          config: config,
          watchdog: {
            isRunning: true,
            message: 'Watchdog ativo - Monitor protegido contra falhas'
          }
        }
      })

    } else if (action === 'stop') {
      // Parar watchdog (apenas por comando manual)
      watchdog.stop()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Monitor parado por comando manual',
          watchdog: {
            isRunning: false,
            message: 'Watchdog parado - Monitor pode parar'
          }
        }
      })

    } else if (action === 'restart') {
      // Forçar reinicialização
      await watchdog.forceRestart()

      return NextResponse.json({
        success: true,
        data: {
          message: 'Monitor reinicializado com sucesso',
          watchdog: {
            isRunning: true,
            message: 'Watchdog reiniciado - Monitor protegido'
          }
        }
      })

    } else {
      return NextResponse.json({
        success: false,
        error: 'Ação inválida. Use "start", "stop" ou "restart"'
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
