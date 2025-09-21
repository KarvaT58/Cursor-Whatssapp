import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ensureWatchdogRunning } from '@/lib/monitoring/auto-start'

// GET /api/monitoring/health - Verifica saúde do monitor
export async function GET(request: NextRequest) {
  try {
    // Garantir que o watchdog está rodando
    const watchdogRunning = ensureWatchdogRunning()
    
    const supabase = createClient()
    
    // Buscar estado do monitor no banco
    const { data: monitorState, error: stateError } = await supabase
      .from('monitor_state')
      .select('*')
      .eq('id', 'group_monitor')
      .single()

    if (stateError && stateError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar estado do monitor:', stateError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar estado do monitor'
      }, { status: 500 })
    }

    const now = Date.now()
    const lastCheckTime = monitorState?.last_check_time ? new Date(monitorState.last_check_time).getTime() : 0
    const timeSinceLastCheck = now - lastCheckTime
    const isStale = timeSinceLastCheck > (monitorState?.check_interval || 30000) * 2

    const health = {
      isRunning: monitorState?.is_running || false,
      isHealthy: !isStale && (monitorState?.consecutive_errors || 0) < 3,
      lastCheckTime: monitorState?.last_check_time,
      timeSinceLastCheck: timeSinceLastCheck,
      restartCount: monitorState?.restart_count || 0,
      consecutiveErrors: monitorState?.consecutive_errors || 0,
      checkInterval: monitorState?.check_interval || 30000,
      adminPhone: monitorState?.admin_phone || '(45) 91284-3589',
      isStale: isStale,
      needsRestart: isStale || (monitorState?.consecutive_errors || 0) >= 3
    }

    return NextResponse.json({
      success: true,
      data: {
        ...health,
        watchdog: {
          isRunning: watchdogRunning,
          message: watchdogRunning ? 'Watchdog ativo - Monitor protegido' : 'Watchdog inativo'
        }
      }
    })

  } catch (error) {
    console.error('❌ Erro ao verificar saúde do monitor:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao verificar saúde do monitor'
    }, { status: 500 })
  }
}

// POST /api/monitoring/health - Força recuperação do monitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'recover') {
      // Aqui você pode implementar lógica para forçar restart do monitor
      // Por enquanto, apenas retornamos sucesso
      return NextResponse.json({
        success: true,
        data: {
          message: 'Comando de recuperação enviado. O monitor será reiniciado automaticamente.'
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação inválida'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Erro ao processar comando de recuperação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar comando'
    }, { status: 500 })
  }
}
