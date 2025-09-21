import { NextRequest, NextResponse } from 'next/server'

// POST /api/webhooks/z-api/debug - Capturar todos os webhooks para debug
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔍 WEBHOOK DEBUG - Dados recebidos:')
    console.log('=====================================')
    console.log('Event:', body.event)
    console.log('Instance:', body.instance)
    console.log('Data:', JSON.stringify(body.data, null, 2))
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    console.log('=====================================')
    
    // Salvar em arquivo de log (opcional)
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: body.event,
      instance: body.instance,
      data: body.data,
      headers: Object.fromEntries(request.headers.entries())
    }
    
    console.log('📝 Log completo:', JSON.stringify(logEntry, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Webhook capturado para debug',
      received: {
        event: body.event,
        instance: body.instance,
        dataKeys: Object.keys(body.data || {}),
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Erro no webhook debug:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook debug' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/z-api/debug - Teste de conectividade
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Endpoint de debug de webhooks funcionando',
    timestamp: new Date().toISOString(),
    instructions: {
      url: 'https://cursor-whatssapp.vercel.app/api/webhooks/z-api/debug',
      method: 'POST',
      description: 'Configure este URL na Z-API para capturar todos os webhooks'
    }
  })
}
