/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { simpleBlacklistChecker } from '@/lib/monitoring/simple-blacklist-checker'
import { messageMonitor } from '@/lib/monitoring/message-monitor'
import { addGroupParticipant, removeGroupParticipant } from '@/lib/group-participants'

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
    [key: string]: unknown
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
  
  // Propriedades para webhooks de grupo
  notification?: string
  notificationParameters?: string[]
}

// GET /api/webhooks/z-api - Teste de webhook
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint funcionando',
    timestamp: new Date().toISOString()
  })
}

// POST /api/webhooks/z-api - Webhook da Z-API
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const contentType = headersList.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type deve ser application/json' },
        { status: 400 }
      )
    }

    const body: ZApiWebhookData = await request.json()
    console.log('📨 WEBHOOK Z-API RECEBIDO:', JSON.stringify(body, null, 2))
    console.log('🔍 WEBHOOK - Tipo:', body.type)
    console.log('🔍 WEBHOOK - Notification:', body.notification)
    console.log('🔍 WEBHOOK - Event:', body.event)
    console.log('🔍 WEBHOOK - Phone:', body.phone)
    console.log('🔍 WEBHOOK - ChatName:', body.chatName)
    console.log('🔍 WEBHOOK - ParticipantPhone:', body.participantPhone)
    console.log('🔍 WEBHOOK - NotificationParameters:', body.notificationParameters)
    console.log('🔍 Tipo de evento:', body.notification || body.event || 'unknown')
    console.log('🔍 Dados do evento:', body.data || body)

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
      console.log('📨 WEBHOOK RECEBIDO - Tipo:', body.type, 'Notification:', body.notification)
      
      // Verificar se é um evento de grupo
      if (body.notification === 'GROUP_PARTICIPANT_LEAVE') {
        console.log('👋 WEBHOOK: Participante saiu do grupo')
        await handleParticipantLeft(supabase, instance.user_id, body)
      } else if (body.notification === 'GROUP_PARTICIPANT_ADD' || body.notification === 'GROUP_PARTICIPANT_INVITE') {
        // CORRIGIDO: Processar tanto ADD quanto INVITE
        console.log('🎯 WEBHOOK: Participante adicionado ao grupo - Notification:', body.notification)
        console.log('📊 WEBHOOK: Dados completos do webhook:', JSON.stringify(body, null, 2))
        await handleParticipantAdded(supabase, instance.user_id, body)
      } else {
        console.log('💬 WEBHOOK: Mensagem recebida normal')
        // Webhook de mensagem recebida normal
        await handleReceivedMessage(supabase, instance.user_id, body)
      }
    } else if (body.event) {
      // Webhook de evento de grupo
      switch (body.event) {
        case 'group.join_request':
          if (body.data) {
          await handleJoinRequest(supabase, instance.user_id, body.data)
          }
          break
        
        case 'group.participant_added':
          if (body.data) {
          await handleParticipantAdded(supabase, instance.user_id, body.data)
          }
          break
        
        case 'group.participant_removed':
          if (body.data) {
          await handleParticipantRemoved(supabase, instance.user_id, body.data)
          }
          break
        
        case 'group.admin_promoted':
          if (body.data) {
          await handleAdminPromoted(supabase, instance.user_id, body.data)
          }
          break
        
        case 'group.admin_demoted':
          if (body.data) {
          await handleAdminDemoted(supabase, instance.user_id, body.data)
          }
          break
        
        case 'group.updated':
          if (body.data) {
          await handleGroupUpdated(supabase, instance.user_id, body.data)
          }
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
    console.log('🔍 Buscando grupo no banco:', {
      whatsapp_id: data.phone,
      user_id: userId,
      group_name: data.chatName
    })

    let { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.phone)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado:', {
        whatsapp_id: data.phone,
        error: groupError,
        group_name: data.chatName
      })
      
      // Tentar buscar por nome do grupo como fallback
      console.log('🔍 Tentando buscar por nome do grupo como fallback...')
      const { data: groupByName, error: groupByNameError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('name', data.chatName)
        .eq('user_id', userId)
        .single()

      if (groupByName && !groupByNameError) {
        console.log('✅ Grupo encontrado por nome, atualizando whatsapp_id:', {
          old_whatsapp_id: groupByName.whatsapp_id,
          new_whatsapp_id: data.phone
        })
        
        // Atualizar o whatsapp_id do grupo
        const { error: updateIdError } = await supabase
          .from('whatsapp_groups')
          .update({ whatsapp_id: data.phone })
          .eq('id', groupByName.id)

        if (updateIdError) {
          console.error('❌ Erro ao atualizar whatsapp_id:', updateIdError)
          return
        }
        
        // Usar o grupo encontrado
        group = groupByName
      } else {
        console.error('❌ Grupo também não encontrado por nome:', {
          group_name: data.chatName,
          error: groupByNameError
        })
        
        // Estratégia 2: Aguardar e tentar novamente (pode ser que o grupo ainda esteja sendo criado)
        console.log('🔍 Estratégia 2: Aguardando e tentando novamente...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: groupRetry, error: groupRetryError } = await supabase
          .from('whatsapp_groups')
          .select('*')
          .eq('whatsapp_id', data.phone)
          .eq('user_id', userId)
          .single()
        
        if (groupRetry && !groupRetryError) {
          console.log('✅ Grupo encontrado após retry!')
          group = groupRetry
        } else {
          // Se o grupo não existe, pode ser um grupo criado recentemente que ainda não foi salvo
          // Vamos aguardar um pouco e tentar novamente
          console.log('⏳ Aguardando 2 segundos e tentando novamente...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          const { data: retryGroup, error: retryError } = await supabase
            .from('whatsapp_groups')
            .select('*')
            .eq('whatsapp_id', data.phone)
            .eq('user_id', userId)
            .single()
          
          if (retryGroup && !retryError) {
            console.log('✅ Grupo encontrado na segunda tentativa!')
            group = retryGroup
          } else {
            console.error('❌ Grupo não encontrado mesmo após retry:', {
              whatsapp_id: data.phone,
              group_name: data.chatName,
              error: retryError
            })
            return
          }
        }
      }
    }

    // Remover participante da nova tabela group_participants
    const removeResult = await removeGroupParticipant(group.id, data.participantPhone)
    if (removeResult.success) {
      console.log('✅ Participante removido da tabela group_participants:', data.participantPhone)
    } else {
      console.error('❌ Erro ao remover participante da tabela group_participants:', removeResult.error)
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

    // Disparar notificação em tempo real
    await triggerRealtimeNotification(supabase, userId, {
      type: 'member_removed',
      group_name: group.name,
      sender_name: data.participantPhone,
      message: `O usuário ${data.participantPhone} saiu do grupo "${group.name}".`,
      is_group: true,
      group_id: group.id,
      participant_phone: data.participantPhone
    })

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
    if (data.isGroup && data.phone && data.participantPhone && data.text?.message) {
      let { data: group, error: groupError } = await supabase
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

      // 🔍 MONITORAMENTO DE MENSAGENS
      console.log('🔍 MESSAGE MONITOR: Iniciando monitoramento de mensagem')
      
      const messageData = {
        messageId: data.messageId || '',
        participantPhone: data.participantPhone,
        groupId: data.phone,
        message: data.text.message,
        timestamp: data.momment || Date.now(),
        senderName: data.senderName || '',
        userId: userId
      }

      // Processar mensagem com o monitor
      const wasBanned = await messageMonitor.processMessage(messageData)
      
      if (wasBanned) {
        console.log('🚫 MESSAGE MONITOR: Usuário foi banido por violação de regras')
        return // Não processar mais nada se foi banido
      }

      console.log('✅ MESSAGE MONITOR: Mensagem aprovada pelo monitor')
    }

    // Para mensagens individuais ou outros tipos
    console.log('📱 Mensagem processada:', {
      type: data.isGroup ? 'grupo' : 'individual',
      sender: data.senderName,
      message: data.text?.message
    })

    // Disparar notificação em tempo real para mensagens de grupo
    if (data.isGroup && data.chatName && data.text?.message) {
      await triggerRealtimeNotification(supabase, userId, {
        type: 'group_updated',
        group_name: data.chatName,
        sender_name: data.senderName,
        message: data.text.message,
        is_group: true,
        group_id: data.phone
      })
    }

  } catch (error) {
    console.error('❌ Erro ao processar mensagem recebida:', error)
  }
}

// Processar solicitação de entrada no grupo
async function handleJoinRequest(
  supabase: any,
  userId: string,
  data: NonNullable<ZApiWebhookData['data']>
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para solicitação de entrada:', data)
      return
    }

    // Buscar dados do grupo
    let { data: group, error: groupError } = await supabase
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
    // CORRIGIDO: Extrair número do participante corretamente
    let participantPhone = data.participantPhone
    
    // Se for GROUP_PARTICIPANT_INVITE, o número está em notificationParameters
    if (data.notification === 'GROUP_PARTICIPANT_INVITE' && data.notificationParameters && data.notificationParameters.length > 0) {
      participantPhone = data.notificationParameters[0]
      console.log('🎯 EXTRAINDO NÚMERO DO INVITE:', participantPhone)
    }

    // 🚨 BLOQUEAR NÚMERO ANTIGO BANIDO PELO WHATSAPP
    if (participantPhone === '554599854508') {
      console.log('🚫 BLOQUEANDO NÚMERO ANTIGO BANIDO PELO WHATSAPP:', participantPhone)
      console.log('🚫 Este número foi banido pelo WhatsApp e não pode ser adicionado a grupos')
      console.log('🚫 Ignorando webhook para evitar crash do grupo')
      
      // Adicionar à blacklist automaticamente
      try {
        const { error: blacklistError } = await supabase
          .from('blacklist')
          .insert({
            phone: participantPhone,
            reason: 'Número banido pelo WhatsApp - causa crash de grupos',
            user_id: userId,
            created_at: new Date().toISOString()
          })

        if (blacklistError) {
          console.log('⚠️ Número já está na blacklist ou erro ao adicionar:', blacklistError.message)
        } else {
          console.log('✅ Número banido adicionado à blacklist automaticamente')
        }
      } catch (error) {
        console.error('❌ Erro ao adicionar à blacklist:', error)
      }

      // Criar notificação de bloqueio
      try {
        const { error: notificationError } = await supabase
          .from('group_notifications')
          .insert({
            user_id: userId,
            type: 'security_alert',
            title: 'Número banido detectado',
            message: `Tentativa de adicionar número banido ${participantPhone} foi bloqueada para proteger o grupo.`,
            data: {
              blocked_phone: participantPhone,
              reason: 'whatsapp_banned_number',
              group_name: data.chatName,
              is_group: true
            }
          })

        if (notificationError) {
          console.error('❌ Erro ao criar notificação de bloqueio:', notificationError)
        } else {
          console.log('✅ Notificação de bloqueio criada')
        }
      } catch (error) {
        console.error('❌ Erro ao criar notificação:', error)
      }
      
      return // ← BLOQUEAR COMPLETAMENTE O PROCESSAMENTO
    }

    console.log('👋 PROCESSANDO PARTICIPANTE ADICIONADO:', {
      groupId: data.phone,
      participantPhone: participantPhone,
      groupName: data.chatName,
      notification: data.notification,
      notificationParameters: data.notificationParameters,
      senderName: data.senderName
    })

    if (!data.phone || !participantPhone) {
      console.error('❌ Dados incompletos para participante adicionado:', {
        phone: data.phone,
        participantPhone: participantPhone,
        notificationParameters: data.notificationParameters
      })
      return
    }

    // Buscar dados do grupo com múltiplas estratégias
    let { data: group, error: groupError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .eq('whatsapp_id', data.phone)
      .eq('user_id', userId)
      .single()

    if (groupError || !group) {
      console.error('❌ Grupo não encontrado pelo whatsapp_id:', data.phone)
      
      // Estratégia 1: Buscar por nome do grupo
      console.log('🔍 Estratégia 1: Buscando por nome do grupo...')
      const { data: groupByName, error: groupByNameError } = await supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('name', data.chatName)
        .eq('user_id', userId)
        .single()

      if (groupByName && !groupByNameError) {
        console.log('✅ Grupo encontrado por nome, atualizando whatsapp_id:', {
          old_whatsapp_id: groupByName.whatsapp_id,
          new_whatsapp_id: data.phone
        })
        
        // Atualizar o whatsapp_id do grupo
        const { error: updateIdError } = await supabase
          .from('whatsapp_groups')
          .update({ 
            whatsapp_id: data.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupByName.id)

        if (updateIdError) {
          console.error('❌ Erro ao atualizar whatsapp_id:', updateIdError)
          return
        }
        
        // Usar o grupo encontrado
        group = groupByName
      } else {
          console.error('❌ Grupo não encontrado mesmo após todas as estratégias:', data.phone)
          return
      }
    }

    // 🔍 VERIFICAÇÃO SIMPLES DE BLACKLIST
    console.log('🔍 SIMPLES: Verificando blacklist para:', participantPhone)
    
    const wasRemoved = await simpleBlacklistChecker.checkAndRemoveIfBlacklisted(
      participantPhone,
      data.phone,
      userId
    )

    if (wasRemoved) {
      console.log('🚫 SIMPLES: Participante removido da blacklist - não adicionando ao grupo')
      return // Não adicionar à lista de participantes
    }

    console.log('✅ Participante não está na blacklist - permitindo entrada')

    // Adicionar participante à nova tabela group_participants
    console.log('🔄 ADICIONANDO PARTICIPANTE À TABELA group_participants:', {
      group_id: group.id,
      group_name: group.name,
      participant_phone: participantPhone,
      participant_name: data.senderName || null
    })
    
    const addResult = await addGroupParticipant(
      group.id, 
      participantPhone, 
      data.senderName || undefined, 
      false, // isAdmin
      false  // isSuperAdmin
    )
    
    if (addResult.success) {
      console.log('✅ PARTICIPANTE ADICIONADO COM SUCESSO à tabela group_participants:', participantPhone)
      console.log('🔄 TRIGGER DEVE ATUALIZAR participant_count automaticamente')
      } else {
      console.error('❌ ERRO ao adicionar participante à tabela group_participants:', addResult.error)
    }

    // Criar notificação de participante adicionado
    const { error: notificationError } = await supabase
      .from('group_notifications')
      .insert({
        group_id: group.id,
        user_id: userId,
        type: 'member_added',
        title: 'Novo participante adicionado',
        message: `O usuário ${participantPhone} foi adicionado ao grupo "${group.name}".`,
        data: {
          participant_phone: participantPhone,
          group_whatsapp_id: data.phone,
          group_name: group.name,
          timestamp: data.momment || Date.now(),
          source: 'webhook'
        }
      })

    if (notificationError) {
      console.error('❌ Erro ao criar notificação de participante adicionado:', notificationError)
    } else {
      console.log('✅ Notificação de participante adicionado criada para:', participantPhone)
    }

    // Disparar notificação em tempo real
    await triggerRealtimeNotification(supabase, userId, {
      type: 'member_added',
      group_name: group.name,
      sender_name: participantPhone,
      message: `O usuário ${participantPhone} foi adicionado ao grupo "${group.name}".`,
      is_group: true,
      group_id: group.id,
      participant_phone: participantPhone
    })
  } catch (error) {
    console.error('❌ Erro ao processar participante adicionado:', error)
  }
}

// Processar participante removido
async function handleParticipantRemoved(
  supabase: any,
  userId: string,
  data: NonNullable<ZApiWebhookData['data']>
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para participante removido:', data)
      return
    }

    // Buscar dados do grupo
    let { data: group, error: groupError } = await supabase
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
      const updatedParticipants = currentParticipants.filter((p: string) => p !== data.participant)
      
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
  data: NonNullable<ZApiWebhookData['data']>
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para admin promovido:', data)
      return
    }

    // Buscar dados do grupo
    let { data: group, error: groupError } = await supabase
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
  data: NonNullable<ZApiWebhookData['data']>
) {
  try {
    if (!data.groupId || !data.participant) {
      console.error('❌ Dados incompletos para admin rebaixado:', data)
      return
    }

    // Buscar dados do grupo
    let { data: group, error: groupError } = await supabase
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
  data: NonNullable<ZApiWebhookData['data']>
) {
  try {
    if (!data.groupId) {
      console.error('❌ Dados incompletos para grupo atualizado:', data)
      return
    }

    // Buscar dados do grupo
    let { data: group, error: groupError } = await supabase
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


// Função para disparar notificações em tempo real
async function triggerRealtimeNotification(
  supabase: any,
  userId: string,
  notificationData: {
    type: string
    group_name?: string
    sender_name?: string
    message?: string
    is_group?: boolean
    group_id?: string
    participant_phone?: string
  }
) {
  try {
    console.log('🔔 Disparando notificação em tempo real:', notificationData)
    
    // Inserir notificação no banco para trigger do SSE
    const { error } = await supabase
      .from('group_notifications')
      .insert({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.group_name || 'Notificação',
        message: notificationData.message,
        group_id: notificationData.group_id,
        data: {
          group_name: notificationData.group_name,
          sender_name: notificationData.sender_name,
          is_group: notificationData.is_group || false,
          participant_phone: notificationData.participant_phone
        },
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Erro ao inserir notificação:', error)
    } else {
      console.log('✅ Notificação em tempo real disparada com sucesso')
    }
  } catch (error) {
    console.error('❌ Erro ao disparar notificação em tempo real:', error)
  }
}
