import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Interface para os dados do webhook da Z-API
interface ZApiWebhookData {
  // Para eventos de grupo (estrutura esperada)
  event?: string
  instance?: string
  data?: {
    phone?: string
    groupId?: string
    groupName?: string
    participant?: string
    participants?: string[]
    message?: string
    timestamp?: number
    [key: string]: any
  }
  
  // Para mensagens recebidas (estrutura real da Z-API)
  isStatusReply?: boolean
  chatLid?: string | null
  connectedPhone?: string
  waitingMessage?: boolean
  isEdit?: boolean
  isGroup?: boolean
  isNewsletter?: boolean
  instanceId?: string
  messageId?: string
  phone?: string
  fromMe?: boolean
  momment?: number
  status?: string
  chatName?: string
  senderPhoto?: string
  senderName?: string
  photo?: string | null
  broadcast?: boolean
  participantPhone?: string
  participantLid?: string
  forwarded?: boolean
  type?: string
  fromApi?: boolean
  text?: {
    message?: string
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

    // Criar cliente Supabase para webhooks (sem cookies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificar se a instância existe e está ativa
    const instanceId = body.instanceId || body.instance
    const { data: instance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('user_id, instance_id')
      .eq('instance_id', instanceId)
      .eq('is_active', true)
      .single()

    if (instanceError || !instance) {
      console.error('❌ Instância não encontrada ou inativa:', instanceId)
      return NextResponse.json(
        { error: 'Instância não encontrada' },
        { status: 404 }
      )
    }

    // Processar diferentes tipos de webhooks
    if (body.type === 'ReceivedCallback') {
      // Verificar se é um evento de grupo
      if (body.notification === 'GROUP_PARTICIPANT_LEAVE') {
        await handleParticipantLeft(supabase, instance.user_id, body)
      } else if (body.notification === 'GROUP_PARTICIPANT_ADD') {
        await handleParticipantAdded(supabase, instance.user_id, body)
      } else {
        // Webhook de mensagem recebida normal
        await handleReceivedMessage(supabase, instance.user_id, body)
      }
    } else if (body.event) {
      // Webhook de evento de grupo
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
    } else {
      console.log('ℹ️ Webhook não processado - tipo desconhecido:', body.type || 'sem tipo')
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

// Processar participante que saiu do grupo
async function handleParticipantLeft(
  supabase: any,
  userId: string,
  data: ZApiWebhookData
) {
  try {
    console.log('👋 Processando participante que saiu:', {
      groupId: data.phone,
      participantPhone: data.participantPhone,
      groupName: data.chatName
    })

    if (!data.phone || !data.participantPhone) {
      console.error('❌ Dados incompletos para participante que saiu:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.phone)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.phone)
      return
    }

    // Atualizar lista de participantes no banco (remover o participante)
    const currentParticipants = group.participants || []
    if (currentParticipants.includes(data.participantPhone)) {
      const updatedParticipants = currentParticipants.filter(p => p !== data.participantPhone)
      
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
        console.log('✅ Participante removido do banco:', data.participantPhone)
      }
    }

    // Criar notificação de participante removido
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'member_removed',
        title: 'Participante saiu do grupo',
        message: `O usuário ${data.participantPhone} saiu do grupo "${group.name}".`,
        data: {
          participant_phone: data.participantPhone,
          group_whatsapp_id: data.phone,
          group_name: group.name,
          timestamp: data.momment || Date.now(),
          source: 'webhook'
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de participante removido:', notificationError)
    } else {
      console.log('✅ Notificação de participante removido criada para:', data.participantPhone)
    }

  } catch (error) {
    console.error('❌ Erro ao processar participante que saiu:', error)
  }
}

// Processar mensagem recebida
async function handleReceivedMessage(
  supabase: any,
  userId: string,
  data: ZApiWebhookData
) {
  try {
    console.log('📨 Processando mensagem recebida:', {
      isGroup: data.isGroup,
      phone: data.phone,
      senderName: data.senderName,
      message: data.text?.message
    })

    // Se for uma mensagem de grupo, verificar se o grupo existe no nosso sistema
    if (data.isGroup && data.phone) {
      const { data: group, error: groupError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('whatsapp_id', data.phone)
        .eq('user_id', userId)
        .single()

      if (groupError || !group) {
        console.log('ℹ️ Grupo não encontrado no sistema:', data.phone)
        return
      }

      console.log('✅ Mensagem de grupo processada:', {
        groupName: group.name,
        sender: data.senderName,
        message: data.text?.message
      })

      // Aqui você pode adicionar lógica para processar mensagens de grupos
      // Por exemplo, salvar no banco, enviar notificações, etc.
    }

    // Para mensagens individuais ou outros tipos
    console.log('📱 Mensagem processada:', {
      type: data.isGroup ? 'grupo' : 'individual',
      sender: data.senderName,
      message: data.text?.message
    })

  } catch (error) {
    console.error('❌ Erro ao processar mensagem recebida:', error)
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

// Processar participante adicionado (nova estrutura)
async function handleParticipantAdded(
  supabase: any,
  userId: string,
  data: ZApiWebhookData
) {
  try {
    console.log('👋 Processando participante adicionado:', {
      groupId: data.phone,
      participantPhone: data.participantPhone,
      groupName: data.chatName
    })

    if (!data.phone || !data.participantPhone) {
      console.error('❌ Dados incompletos para participante adicionado:', data)
      return
    }

    // Buscar dados do grupo
    const { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.phone)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', data.phone)
      return
    }

    // 🔍 VERIFICAR BLACKLIST ANTES DE ADICIONAR
    console.log('🔍 Verificando blacklist para:', data.participantPhone)
    const { data: blacklistEntry, error: blacklistError } = await supabase
      .from('blacklist')
      .select('*')
      .eq('phone', data.participantPhone)
      .eq('user_id', userId)
      .single()

    if (blacklistError && blacklistError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar blacklist:', blacklistError)
    }

    // Se o participante está na blacklist, remover imediatamente
    if (blacklistEntry) {
      console.log('🚫 PARTICIPANTE ENCONTRADO NA BLACKLIST - REMOVENDO AUTOMATICAMENTE')
      
      // Remover do grupo via Z-API
      await removeParticipantFromGroup(data.phone, data.participantPhone, userId, supabase)
      
      // Enviar mensagem de banimento
      await sendBanMessage(data.participantPhone, userId, supabase)
      
      // Criar notificação de remoção por blacklist
      const { error: notificationError } = await supabase
        .from('group_notifications')
        .insert({
          group_id: group.id,
          user_id: userId,
          type: 'member_banned',
          title: 'Participante removido por blacklist',
          message: `O usuário ${data.participantPhone} foi removido automaticamente do grupo "${group.name}" por estar na blacklist.`,
          data: {
            participant_phone: data.participantPhone,
            group_whatsapp_id: data.phone,
            group_name: group.name,
            timestamp: data.momment || Date.now(),
            source: 'webhook_blacklist_check',
            reason: 'blacklist'
          }
        })

      if (notificationError) {
        console.error('❌ Erro ao criar notificação de banimento:', notificationError)
      } else {
        console.log('✅ Notificação de banimento criada para:', data.participantPhone)
      }

      return // Não adicionar à lista de participantes
    }

    console.log('✅ Participante não está na blacklist - permitindo entrada')

    // Atualizar lista de participantes no banco
    const currentParticipants = group.participants || []
    if (!currentParticipants.includes(data.participantPhone)) {
      const updatedParticipants = [...currentParticipants, data.participantPhone]
      
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
        console.log('✅ Participante adicionado ao banco:', data.participantPhone)
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
        message: `O usuário ${data.participantPhone} foi adicionado ao grupo "${group.name}".`,
        data: {
          participant_phone: data.participantPhone,
          group_whatsapp_id: data.phone,
          group_name: group.name,
          timestamp: data.momment || Date.now(),
          source: 'webhook'
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de participante adicionado:', notificationError)
    } else {
      console.log('✅ Notificação de participante adicionado criada para:', data.participantPhone)
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

// Remover participante do grupo via Z-API
async function removeParticipantFromGroup(
  groupId: string,
  participantPhone: string,
  userId: string,
  supabase: any
) {
  try {
    console.log('🚫 Removendo participante do grupo:', { groupId, participantPhone })

    // Buscar instância Z-API ativa
    const { data: zApiInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (instanceError || !zApiInstance) {
      console.error('❌ Instância Z-API não encontrada para remoção:', instanceError)
      return
    }

    // Fazer requisição para remover participante
    const response = await fetch(
      `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/remove-participant`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupId,
          phone: participantPhone
        })
      }
    )

    const result = await response.json()
    
    if (response.ok && result.value) {
      console.log('✅ Participante removido com sucesso do grupo:', participantPhone)
    } else {
      console.error('❌ Erro ao remover participante:', result)
    }

  } catch (error) {
    console.error('❌ Erro ao remover participante do grupo:', error)
  }
}

// Enviar mensagem de banimento para o contato
async function sendBanMessage(
  participantPhone: string,
  userId: string,
  supabase: any
) {
  try {
    console.log('📱 Enviando mensagem de banimento para:', participantPhone)

    // Buscar instância Z-API ativa
    const { data: zApiInstance, error: instanceError } = await supabase
      .from('z_api_instances')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (instanceError || !zApiInstance) {
      console.error('❌ Instância Z-API não encontrada para envio de mensagem:', instanceError)
      return
    }

    // Mensagem de banimento
    const banMessage = "Você está banido dos grupos do WhatsApp. Contate o administrador para mais informações: (45) 91284-3589"

    // Fazer requisição para enviar mensagem
    const response = await fetch(
      `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/send-text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: participantPhone,
          message: banMessage
        })
      }
    )

    const result = await response.json()
    
    if (response.ok && result.value) {
      console.log('✅ Mensagem de banimento enviada com sucesso para:', participantPhone)
    } else {
      console.error('❌ Erro ao enviar mensagem de banimento:', result)
    }

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem de banimento:', error)
  }
}