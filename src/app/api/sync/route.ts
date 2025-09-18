import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SyncService } from '@/lib/sync/sync-service'
import { ZApiClient } from '@/lib/z-api/client'

const FullSyncSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID é obrigatório'),
  direction: z.enum(['from_whatsapp', 'to_whatsapp', 'bidirectional']).default('from_whatsapp'),
  includeGroups: z.boolean().default(true),
  includeCommunities: z.boolean().default(true),
  includeParticipants: z.boolean().default(true),
  includeAdmins: z.boolean().default(true),
  options: z.object({
    forceUpdate: z.boolean().default(false),
    includeMessages: z.boolean().default(false),
    includeAnnouncements: z.boolean().default(false),
    batchSize: z.number().min(1).max(100).default(50),
  }).optional(),
})

// POST /api/sync - Sincronização completa do sistema
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
    const { 
      instanceId, 
      direction, 
      includeGroups, 
      includeCommunities, 
      includeParticipants, 
      includeAdmins, 
      options 
    } = FullSyncSchema.parse(body)

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

    const results = []
    let totalStats = { created: 0, updated: 0, deleted: 0, errors: 0 }

    // Sincronizar grupos
    if (includeGroups) {
      try {
        let groupsResult
        if (direction === 'from_whatsapp') {
          groupsResult = await syncService.syncGroupsFromWhatsApp(options)
        } else if (direction === 'to_whatsapp') {
          groupsResult = await syncService.syncGroupsToWhatsApp(options)
        } else {
          // Bidirectional
          const [fromResult, toResult] = await Promise.all([
            syncService.syncGroupsFromWhatsApp(options),
            syncService.syncGroupsToWhatsApp(options)
          ])
          
          groupsResult = {
            success: fromResult.success && toResult.success,
            data: { fromWhatsApp: fromResult.data, toWhatsApp: toResult.data },
            stats: {
              created: (fromResult.stats?.created || 0) + (toResult.stats?.created || 0),
              updated: (fromResult.stats?.updated || 0) + (toResult.stats?.updated || 0),
              deleted: (fromResult.stats?.deleted || 0) + (toResult.stats?.deleted || 0),
              errors: (fromResult.stats?.errors || 0) + (toResult.stats?.errors || 0)
            },
            error: !fromResult.success ? fromResult.error : !toResult.success ? toResult.error : undefined
          }
        }

        results.push({
          type: 'groups',
          result: groupsResult
        })

        if (groupsResult.stats) {
          totalStats.created += groupsResult.stats.created
          totalStats.updated += groupsResult.stats.updated
          totalStats.deleted += groupsResult.stats.deleted
          totalStats.errors += groupsResult.stats.errors
        }
      } catch (error) {
        console.error('Erro ao sincronizar grupos:', error)
        results.push({
          type: 'groups',
          result: { success: false, error: 'Erro ao sincronizar grupos' }
        })
        totalStats.errors++
      }
    }

    // Sincronizar comunidades
    if (includeCommunities) {
      try {
        let communitiesResult
        if (direction === 'from_whatsapp') {
          communitiesResult = await syncService.syncCommunitiesFromWhatsApp(options)
        } else if (direction === 'to_whatsapp') {
          communitiesResult = await syncService.syncCommunitiesToWhatsApp(options)
        } else {
          // Bidirectional
          const [fromResult, toResult] = await Promise.all([
            syncService.syncCommunitiesFromWhatsApp(options),
            syncService.syncCommunitiesToWhatsApp(options)
          ])
          
          communitiesResult = {
            success: fromResult.success && toResult.success,
            data: { fromWhatsApp: fromResult.data, toWhatsApp: toResult.data },
            stats: {
              created: (fromResult.stats?.created || 0) + (toResult.stats?.created || 0),
              updated: (fromResult.stats?.updated || 0) + (toResult.stats?.updated || 0),
              deleted: (fromResult.stats?.deleted || 0) + (toResult.stats?.deleted || 0),
              errors: (fromResult.stats?.errors || 0) + (toResult.stats?.errors || 0)
            },
            error: !fromResult.success ? fromResult.error : !toResult.success ? toResult.error : undefined
          }
        }

        results.push({
          type: 'communities',
          result: communitiesResult
        })

        if (communitiesResult.stats) {
          totalStats.created += communitiesResult.stats.created
          totalStats.updated += communitiesResult.stats.updated
          totalStats.deleted += communitiesResult.stats.deleted
          totalStats.errors += communitiesResult.stats.errors
        }
      } catch (error) {
        console.error('Erro ao sincronizar comunidades:', error)
        results.push({
          type: 'communities',
          result: { success: false, error: 'Erro ao sincronizar comunidades' }
        })
        totalStats.errors++
      }
    }

    // Sincronizar participantes e administradores de grupos (se solicitado)
    if (includeParticipants || includeAdmins) {
      try {
        // Obter grupos do usuário para sincronizar detalhes
        const { data: userGroups } = await supabase
          .from('whatsapp_groups')
          .select('id, whatsapp_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .not('whatsapp_id', 'is', null)

        const groupDetailsResults = []

        for (const group of userGroups || []) {
          try {
            if (includeParticipants) {
              const participantsResult = await syncService.syncGroupParticipants(group.id, options)
              groupDetailsResults.push({
                groupId: group.id,
                type: 'participants',
                result: participantsResult
              })
            }

            if (includeAdmins) {
              const adminsResult = await syncService.syncGroupAdmins(group.id, options)
              groupDetailsResults.push({
                groupId: group.id,
                type: 'admins',
                result: adminsResult
              })
            }
          } catch (error) {
            console.error(`Erro ao sincronizar detalhes do grupo ${group.id}:`, error)
            totalStats.errors++
          }
        }

        results.push({
          type: 'group_details',
          result: {
            success: true,
            data: groupDetailsResults
          }
        })
      } catch (error) {
        console.error('Erro ao sincronizar detalhes dos grupos:', error)
        results.push({
          type: 'group_details',
          result: { success: false, error: 'Erro ao sincronizar detalhes dos grupos' }
        })
        totalStats.errors++
      }
    }

    // Verificar se houve algum erro
    const hasErrors = results.some(r => !r.result.success)
    const success = !hasErrors

    return NextResponse.json({
      success,
      data: {
        direction,
        included: {
          groups: includeGroups,
          communities: includeCommunities,
          participants: includeParticipants,
          admins: includeAdmins
        },
        results: results.map(r => ({
          type: r.type,
          success: r.result.success,
          data: r.result.data,
          error: r.result.error
        }))
      },
      stats: totalStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro na API de sincronização completa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
