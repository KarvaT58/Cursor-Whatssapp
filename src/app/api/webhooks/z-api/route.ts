import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Interface para os dados do webhook da Z-API
interface ZApiWebhookData {
  event: string
  instance: string
  data: {
    phone?: string
    groupId?: string
    groupName?: string
    participant?: string
    participants?: string[]
    message?: string
    timestamp?: number
    [key: string]: any
  }
}

// GET /api/webhooks/z-api - Teste de webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint funcionando',
    timestamp: new Date().toISOString()
  })
}

// POST /api/webhooks/z-api - Webhook da Z-API
export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const contentType = headersList.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser application/json' },
        { status: 400 }
      )
    }

    const body: ZApiWebhookData = await request.json()
    console.log('📨 Webhook Z-API recebido:', body)

    const supabase = createClient()

    // Verificar se a instância existe e está ativa
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('user_id, instance_id')
      .eq('instance_id', body.instance)
      .eq('is_active', true)
      .single()

    if (instanceError || !instance) {
      console.error('❌ Instância não encontrada ou inativa:', body.instance)
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // Processar diferentes tipos de eventos
    switch (body.event) {
      case 'group.join_request':
        await handleJoinRequest(supabase, instance.user_id, body.data)
        break
      
      case 'group.participant_added':
        await handleParticipantAdded(supabase, instance.user_id, body.data)
        break
      
      case 'group.participant_removed':
        await handleParticipantRemoved(supabase, instance.user_id, body.data)
        break
      
      case 'group.admin_promoted':
        await handleAdminPromoted(supabase, instance.user_id, body.data)
        break
      
      case 'group.admin_demoted':
        await handleAdminDemoted(supabase, instance.user_id, body.data)
        break
      
      case 'group.updated':
        await handleGroupUpdated(supabase, instance.user_id, body.data)
        break
      
      default:
        console.log('ℹ️ Evento não processado:', body.event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro no webhook Z-API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Processar solicitação de entrada no grupo
async function handleJoinRequest(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para solicitação de entrada:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Criar notificação de solicitação de entrada
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'join_request',
        title: 'Nova solicitação de entrada',
        message: `O usuário ${data.participant} solicitou entrada no grupo "${group.name}".`,
        data: {
          requester_phone: data.participant,
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          timestamp: data.timestamp || Date.now()
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de solicitação:', notificationError)
    } else {
      console.log('✅ Notificação de solicitação criada para:', data.participant)
    }
  } catch (error) {
    console.error('❌ Erro ao processar solicitação de entrada:', error)
  }
}

// Processar participante adicionado
async function handleParticipantAdded(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para participante adicionado:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Atualizar lista de participantes no banco
    const currentParticipants = group.participants || []
    if (!currentParticipants.includes(data.participant)) {
      const updatedParticipants = [...currentParticipants, data.participant]
      
      const { error: updateError } = await supabase
        .from('whatsapp_groups')
        .update({
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar participantes:', updateError)
      } else {
        console.log('✅ Participante adicionado ao banco:', data.participant)
      }
    }

    // Criar notificação de participante adicionado
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'member_added',
        title: 'Novo participante adicionado',
        message: `O usuário ${data.participant} foi adicionado ao grupo "${group.name}".`,
        data: {
          participant_phone: data.participant,
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          timestamp: data.timestamp || Date.now(),
          source: 'webhook'
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de participante adicionado:', notificationError)
    } else {
      console.log('✅ Notificação de participante adicionado criada para:', data.participant)
    }
  } catch (error) {
    console.error('❌ Erro ao processar participante adicionado:', error)
  }
}

// Processar participante removido
async function handleParticipantRemoved(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para participante removido:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Atualizar lista de participantes no banco (remover o participante)
    const currentParticipants = group.participants || []
    if (currentParticipants.includes(data.participant)) {
      const updatedParticipants = currentParticipants.filter(p => p !== data.participant)
      
      const { error: updateError } = await supabase
        .from('whatsapp_groups')
        .update({
          participants: updatedParticipants,
          updated_at: new Date().toISOString()
        })
        .eq('id', group.id)

      if (updateError) {
        console.error('❌ Erro ao atualizar participantes:', updateError)
      } else {
        console.log('✅ Participante removido do banco:', data.participant)
      }
    }

    // Criar notificação de participante removido
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'member_removed',
        title: 'Participante removido',
        message: `O usuário ${data.participant} foi removido do grupo "${group.name}".`,
        data: {
          participant_phone: data.participant,
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          timestamp: data.timestamp || Date.now(),
          source: 'webhook'
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de participante removido:', notificationError)
    } else {
      console.log('✅ Notificação de participante removido criada para:', data.participant)
    }
  } catch (error) {
    console.error('❌ Erro ao processar participante removido:', error)
  }
}

// Processar admin promovido
async function handleAdminPromoted(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para admin promovido:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Criar notificação de admin promovido
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'admin_promotion',
        title: 'Novo administrador',
        message: `O usuário ${data.participant} foi promovido a administrador do grupo "${group.name}".`,
        data: {
          participant_phone: data.participant,
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          timestamp: data.timestamp || Date.now()
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de admin promovido:', notificationError)
    } else {
      console.log('✅ Notificação de admin promovido criada para:', data.participant)
    }
  } catch (error) {
    console.error('❌ Erro ao processar admin promovido:', error)
  }
}

// Processar admin rebaixado
async function handleAdminDemoted(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para admin rebaixado:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Criar notificação de admin rebaixado
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'admin_promotion',
        title: 'Administrador rebaixado',
        message: `O usuário ${data.participant} foi rebaixado de administrador do grupo "${group.name}".`,
        data: {
          participant_phone: data.participant,
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          timestamp: data.timestamp || Date.now()
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de admin rebaixado:', notificationError)
    } else {
      console.log('✅ Notificação de admin rebaixado criada para:', data.participant)
    }
  } catch (error) {
    console.error('❌ Erro ao processar admin rebaixado:', error)
  }
}

// Processar grupo atualizado
async function handleGroupUpdated(
  supabase: any,
  userId: string,
  data: ZApiWebhookData['data']
) {
  try {
    if (!data.groupId) {
      console.error('❌ Dados incompletos para grupo atualizado:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.groupId)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.groupId)
      return
    }

    // Criar notificação de grupo atualizado
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'group_updated',
        title: 'Grupo atualizado',
        message: `O grupo "${group.name}" foi atualizado.`,
        data: {
          group_whatsapp_id: data.groupId,
          group_name: group.name,
          changes: data,
          timestamp: data.timestamp || Date.now()
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de grupo atualizado:', notificationError)
    } else {
      console.log('✅ Notificação de grupo atualizado criada para:', data.groupId)
    }
  } catch (error) {
    console.error('❌ Erro ao processar grupo atualizado:', error)
  }
}