import { NextRequest, NextResponse } from 'next/server'
import { blacklistCache } from '@/lib/monitoring/blacklist-cache'

// GET /api/monitoring/blacklist-cache - Status do cache
export async function GET(request: NextRequest) {
  try {
    const stats = blacklistCache.getCacheStats()
    
    return NextResponse.json({
      success: true,
      data: {
        cacheStats: stats,
        totalUsers: Object.keys(stats).length,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Erro ao obter status do cache:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao obter status do cache'
    }, { status: 500 })
  }
}

// POST /api/monitoring/blacklist-cache - Gerenciar cache
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId } = body

    if (action === 'refresh' && userId) {
      await blacklistCache.forceRefresh(userId)
      return NextResponse.json({
        success: true,
        data: {
          message: `Cache atualizado para usuário ${userId}`,
          timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'invalidate' && userId) {
      blacklistCache.invalidateCache(userId)
      return NextResponse.json({
        success: true,
        data: {
          message: `Cache invalidado para usuário ${userId}`,
          timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'refresh_all') {
      // Buscar todos os usuários que têm blacklist
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { data: users, error } = await supabase
        .from('blacklist')
        .select('user_id')
        .not('user_id', 'is', null)

      if (error) {
        throw error
      }

      const uniqueUsers = [...new Set(users.map(u => u.user_id))]
      
      // Atualizar cache para todos os usuários
      for (const uid of uniqueUsers) {
        await blacklistCache.forceRefresh(uid)
      }

      return NextResponse.json({
        success: true,
        data: {
          message: `Cache atualizado para ${uniqueUsers.length} usuários`,
          users: uniqueUsers,
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Ação inválida. Use: refresh, invalidate, ou refresh_all'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Erro ao gerenciar cache:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerenciar cache'
    }, { status: 500 })
  }
}
