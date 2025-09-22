import { NextRequest } from 'next/server'
import { createSafeClient, safeGetUser } from '@/lib/supabase/safe-client'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const headersList = headers()
    const supabase = await createSafeClient()

    // Verificar autenticação de forma segura
    const { user, error: authError } = await safeGetUser(supabase)
    if (authError || !user) {
      console.error('❌ Erro de autenticação no endpoint de notificações:', authError)
      return new Response('Unauthorized', { status: 401 })
    }

  // Configurar SSE
  const stream = new ReadableStream({
    start(controller) {
      // Enviar evento de conexão
      const connectEvent = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Conectado ao sistema de notificações em tempo real',
        timestamp: new Date().toISOString()
      })}\n\n`
      controller.enqueue(new TextEncoder().encode(connectEvent))

      // Configurar listener para mudanças no banco de dados
      const channel = supabase
        .channel('realtime-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'whatsapp_groups',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔄 Mudança detectada no grupo:', payload)
            
            const event = `data: ${JSON.stringify({
              type: 'group_update',
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString()
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(event))
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'group_notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 Nova notificação:', payload)
            
            const event = `data: ${JSON.stringify({
              type: 'notification',
              event: payload.eventType,
              data: payload.new || payload.old,
              timestamp: new Date().toISOString()
            })}\n\n`
            
            controller.enqueue(new TextEncoder().encode(event))
          }
        )
        .subscribe()

      // Manter conexão viva com heartbeat
      const heartbeat = setInterval(() => {
        const heartbeatEvent = `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })}\n\n`
        controller.enqueue(new TextEncoder().encode(heartbeatEvent))
      }, 30000) // A cada 30 segundos

      // Cleanup quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        console.log('🔌 Conexão SSE fechada')
        clearInterval(heartbeat)
        supabase.removeChannel(channel)
        controller.close()
      })
    }
  })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })
  } catch (error) {
    console.error('❌ Erro no endpoint de notificações em tempo real:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
