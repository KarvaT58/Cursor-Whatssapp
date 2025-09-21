import { NextRequest, NextResponse } from 'next/server'
import { GroupMonitor } from '@/lib/monitoring/group-monitor'

// Instância global do monitor (singleton)
let groupMonitor: GroupMonitor | null = null

// GET /api/monitoring/group-monitor - Status do monitor
export async function GET(request: NextRequest) {
  try {
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
