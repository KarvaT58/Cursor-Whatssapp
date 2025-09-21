import { NextRequest, NextResponse } from 'next/server'

// GET /api/health - Health check simples
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Sistema funcionando',
      timestamp: new Date().toISOString(),
      status: 'healthy'
    })
  } catch (error) {
    console.error('❌ Erro no health check:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
