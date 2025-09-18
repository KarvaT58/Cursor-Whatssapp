import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { SyncServiceServer } from '@/lib/sync/sync-service-server'
import { ZApiClient } from '@/lib/z-api/client'

const SyncGroupDetailsSchema = z.object({
  instanceId: z.string().min(1, 'Instance ID é obrigatório'),
  syncType: z.enum(['participants', 'admins', 'both']).default('both'),
  options: z.object({
    forceUpdate: z.boolean().default(false),
    includeMetadata: z.boolean().default(true),
  }).optional(),
})

// POST /api/groups/[id]/sync - Sincronizar detalhes de um grupo específico
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id: groupId } = await params
    if (!groupId) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 })
    }

    const body = await request.json()
    const { instanceId, syncType, options } = SyncGroupDetailsSchema.parse(body)

    // Verificar se o grupo existe e pertence ao usuário
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Grupo não encontrado' },
        { status: 404 }
      )
    }

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
    const syncService = new SyncServiceServer(zApiClient, user.id)

    const results = []
    let totalStats = { created: 0, updated: 0, deleted: 0, errors: 0 }

    // Sincronizar participantes
    if (syncType === 'participants' || syncType === 'both') {
      try {
        const participantsResult = await syncService.syncGroupParticipants(groupId, options)
        results.push({
          type: 'participants',
          result: participantsResult
        })
        
        if (participantsResult.stats) {
          totalStats.created += participantsResult.stats.created
          totalStats.updated += participantsResult.stats.updated
          totalStats.deleted += participantsResult.stats.deleted
          totalStats.errors += participantsResult.stats.errors
        }
      } catch (error) {
        console.error('Erro ao sincronizar participantes:', error)
        results.push({
          type: 'participants',
          result: { success: false, error: 'Erro ao sincronizar participantes' }
        })
        totalStats.errors++
      }
    }

    // Sincronizar administradores
    if (syncType === 'admins' || syncType === 'both') {
      try {
        const adminsResult = await syncService.syncGroupAdmins(groupId, options)
        results.push({
          type: 'admins',
          result: adminsResult
        })
        
        if (adminsResult.stats) {
          totalStats.created += adminsResult.stats.created
          totalStats.updated += adminsResult.stats.updated
          totalStats.deleted += adminsResult.stats.deleted
          totalStats.errors += adminsResult.stats.errors
        }
      } catch (error) {
        console.error('Erro ao sincronizar administradores:', error)
        results.push({
          type: 'admins',
          result: { success: false, error: 'Erro ao sincronizar administradores' }
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
        groupId,
        syncType,
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

    console.error('Erro na API de sincronização de detalhes do grupo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
