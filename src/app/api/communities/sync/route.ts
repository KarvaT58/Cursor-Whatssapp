import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SyncService } from '@/lib/sync/sync-service'
import { ZApiClient } from '@/lib/z-api/client'

const SyncCommunitiesSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID é obrigatório'),
  direction: z.enum(['from_whatsapp', 'to_whatsapp', 'bidirectional']).default('from_whatsapp'),
  options: z.object({
    forceUpdate: z.boolean().default(false),
    includeGroups: z.boolean().default(true),
    includeMembers: z.boolean().default(true),
    includeAnnouncements: z.boolean().default(false),
    batchSize: z.number().min(1).max(100).default(50),
  }).optional(),
})

// POST /api/communities/sync - Sincronizar comunidades do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { instanceId, direction, options } = SyncCommunitiesSchema.parse(body)

    // Obter instância Z-API
    const { data: instance } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('id', instanceId)
      .eq('user_id', user.id)
      .single()

    if (!instance) {
      return NextResponse.json(
        { error: 'Instância Z-API não encontrada' },
        { status: 404 }
      )
    }

    // Criar cliente Z-API
    const zApiClient = new ZApiClient(
      instance.instance_id,
      instance.instance_token,
      instance.client_token
    )

    // Criar serviço de sincronização
    const syncService = new SyncService(zApiClient)

    let result

    // Executar sincronização baseada na direção
    switch (direction) {
      case 'from_whatsapp':
        result = await syncService.syncCommunitiesFromWhatsApp(options)
        break
      case 'to_whatsapp':
        result = await syncService.syncCommunitiesToWhatsApp(options)
        break
      case 'bidirectional':
        // Executar ambas as direções
        const [fromResult, toResult] = await Promise.all([
          syncService.syncCommunitiesFromWhatsApp(options),
          syncService.syncCommunitiesToWhatsApp(options)
        ])

        result = {
          success: fromResult.success && toResult.success,
          data: {
            fromWhatsApp: fromResult.data,
            toWhatsApp: toResult.data
          },
          stats: {
            created: (fromResult.stats?.created || 0) + (toResult.stats?.created || 0),
            updated: (fromResult.stats?.updated || 0) + (toResult.stats?.updated || 0),
            deleted: (fromResult.stats?.deleted || 0) + (toResult.stats?.deleted || 0),
            errors: (fromResult.stats?.errors || 0) + (toResult.stats?.errors || 0)
          },
          error: !fromResult.success ? fromResult.error : !toResult.success ? toResult.error : undefined
        }
        break
      default:
        return NextResponse.json(
          { error: 'Direção de sincronização inválida' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro na sincronização' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      stats: result.stats,
      direction,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de sincronização de comunidades:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
