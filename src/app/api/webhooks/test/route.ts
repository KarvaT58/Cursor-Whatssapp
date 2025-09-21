import { NextRequest, NextResponse } from 'next/server'

// GET /api/webhooks/test - Teste de webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook test endpoint funcionando',
    method: 'GET',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}

// POST /api/webhooks/test - Teste de webhook POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({
      success: true,
      message: 'Webhook test endpoint funcionando',
      method: 'POST',
      timestamp: new Date().toISOString(),
      receivedData: body,
      url: request.url
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro ao processar webhook test',
      method: 'POST',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      url: request.url
    })
  }
}

// PUT /api/webhooks/test - Teste de webhook PUT
export async function PUT(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook test endpoint funcionando',
    method: 'PUT',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}

// DELETE /api/webhooks/test - Teste de webhook DELETE
export async function DELETE(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook test endpoint funcionando',
    method: 'DELETE',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}
