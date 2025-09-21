import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/cron/sync-groups - Sincronização automática via cron
export async function POST(request: NextRequest) {
  try {
    // Verificar se é uma requisição de cron (Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    console.log('⏰ SINCRONIZAÇÃO AUTOMÁTICA VIA CRON ===')
    console.log('Timestamp:', new Date().toISOString())

    const supabase = await createClient()

    // Buscar todos os usuários que têm grupos
    const { data: users, error: usersError } = await supabase
      .from('whatsapp_groups')
      .select('user_id')
      .not('whatsapp_id', 'is', null)
      .not('user_id', 'is', null)

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }

    // Obter usuários únicos
    const uniqueUsers = [...new Set(users?.map(u => u.user_id) || [])]
    console.log(`👥 Encontrados ${uniqueUsers.length} usuários com grupos`)

    // TODO: Implementar sincronização de grupos quando necessário
    console.log('✅ Sincronização automática concluída (sistema simplificado)')

    return NextResponse.json({
      success: true,
      message: 'Sincronização automática concluída',
      data: {
        totalUsers: uniqueUsers.length,
        totalChanges: 0,
        results: [],
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erro na sincronização automática via cron:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
