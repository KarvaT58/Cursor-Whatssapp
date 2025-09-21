import { createClient } from '@supabase/supabase-js'

export interface GroupMonitorConfig {
  checkInterval: number // em milissegundos (30000 = 30 segundos)
  adminPhone: string // telefone do administrador para mensagens de banimento
}

export class GroupMonitor {
  private supabase: any
  private config: GroupMonitorConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  constructor(config: GroupMonitorConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Inicia o monitoramento automático
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitor já está rodando')
      return
    }

    console.log('🚀 Iniciando monitor de grupos com intervalo de', this.config.checkInterval, 'ms')
    this.isRunning = true

    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllGroups()
      } catch (error) {
        console.error('❌ Erro no monitor de grupos:', error)
      }
    }, this.config.checkInterval)

    // Executar verificação imediata
    this.checkAllGroups()
  }

  /**
   * Para o monitoramento
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('⏹️ Monitor de grupos parado')
  }

  /**
   * Verifica todos os grupos ativos
   */
  private async checkAllGroups() {
    try {
      console.log('🔍 Verificando todos os grupos ativos...')

      // Buscar todos os grupos ativos com timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos timeout

      try {
        const { data: groups, error: groupsError } = await this.supabase
          .from('whatsapp_groups')
          .select(`
            *,
            group_families (
              id,
              name,
              user_id
            )
          `)
          .not('whatsapp_id', 'is', null)

        clearTimeout(timeoutId)

        if (groupsError) {
          console.error('❌ Erro ao buscar grupos:', {
            message: groupsError.message,
            details: groupsError.details,
            hint: groupsError.hint,
            code: groupsError.code
          })
          return
        }

        if (!groups || groups.length === 0) {
          console.log('ℹ️ Nenhum grupo ativo encontrado')
          return
        }

        console.log(`📋 Encontrados ${groups.length} grupos para verificar`)

        // Verificar cada grupo com delay para evitar sobrecarga
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i]
          console.log(`🔍 Verificando grupo ${i + 1}/${groups.length}: ${group.name}`)
          
          await this.checkGroupParticipants(group)
          
          // Pequeno delay entre verificações para evitar sobrecarga da API
          if (i < groups.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos entre grupos
          }
        }

      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }

    } catch (error) {
      console.error('❌ Erro ao verificar grupos:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
        hint: '',
        code: ''
      })
    }
  }

  /**
   * Verifica participantes de um grupo específico
   */
  private async checkGroupParticipants(group: any) {
    try {
      console.log(`🔍 Verificando grupo: ${group.name} (${group.whatsapp_id})`)

      // Buscar participantes atuais do grupo via Z-API
      const currentParticipants = await this.getGroupParticipantsFromZApi(group)
      
      if (!currentParticipants) {
        console.log('⚠️ Não foi possível obter participantes do grupo:', group.name)
        return
      }

      // Comparar com participantes salvos no banco
      const savedParticipants = group.participants || []
      
      // Encontrar novos participantes
      const newParticipants = currentParticipants.filter(
        (participant: string) => !savedParticipants.includes(participant)
      )

      if (newParticipants.length > 0) {
        console.log(`🆕 Novos participantes encontrados em ${group.name}:`, newParticipants)
        
        // Verificar cada novo participante
        for (const participant of newParticipants) {
          await this.checkParticipantBlacklist(participant, group)
        }
      }

      // Atualizar lista de participantes no banco
      await this.updateGroupParticipants(group.id, currentParticipants)

    } catch (error) {
      console.error(`❌ Erro ao verificar grupo ${group.name}:`, error)
    }
  }

  /**
   * Busca participantes atuais do grupo via Z-API
   */
  private async getGroupParticipantsFromZApi(group: any): Promise<string[] | null> {
    const maxRetries = 3
    const retryDelay = 1000 // 1 segundo

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Buscar instância Z-API ativa do usuário
        const { data: zApiInstance, error: instanceError } = await this.supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', group.group_families.user_id)
          .eq('is_active', true)
          .single()

        if (instanceError || !zApiInstance) {
          console.error('❌ Instância Z-API não encontrada para grupo:', group.name)
          return null
        }

        // Fazer requisição para obter metadados do grupo com timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

        try {
          const response = await fetch(
            `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/group-metadata/${group.whatsapp_id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Client-Token': zApiInstance.client_token || '',
              },
              signal: controller.signal
            }
          )

          clearTimeout(timeoutId)
          const result = await response.json()
          
          if (response.ok && result.participants) {
            // Extrair apenas os números de telefone dos participantes
            const participants = result.participants.map((p: any) => p.phone).filter(Boolean)
            console.log(`📋 Participantes obtidos do grupo ${group.name}:`, participants.length)
            console.log(`📋 Lista completa de participantes:`, participants)
            return participants
          } else {
            console.error('❌ Erro ao obter participantes do grupo:', result)
            return null
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }

      } catch (error) {
        console.error(`❌ Erro ao buscar participantes via Z-API (tentativa ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          console.error('❌ Falha definitiva ao obter participantes do grupo:', group.name)
          return null
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }

    return null
  }

  /**
   * Verifica se um participante está na blacklist
   */
  private async checkParticipantBlacklist(participantPhone: string, group: any) {
    try {
      console.log(`🔍 Verificando blacklist para: ${participantPhone}`)
      console.log(`🔍 User ID do grupo: ${group.group_families.user_id}`)

      // Primeiro, vamos ver todos os contatos da blacklist para debug
      const { data: allBlacklist, error: allBlacklistError } = await this.supabase
        .from('blacklist')
        .select('*')
        .eq('user_id', group.group_families.user_id)

      console.log(`🔍 Todos os contatos na blacklist para este usuário:`, allBlacklist)

      // Verificar se está na blacklist
      const { data: blacklistEntry, error: blacklistError } = await this.supabase
        .from('blacklist')
        .select('*')
        .eq('phone', participantPhone)
        .eq('user_id', group.group_families.user_id)
        .single()

      console.log(`🔍 Resultado da consulta blacklist para ${participantPhone}:`, { blacklistEntry, blacklistError })

      if (blacklistError && blacklistError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar blacklist:', blacklistError)
        return
      }

      // Se está na blacklist, remover imediatamente
      if (blacklistEntry) {
        console.log(`🚫 PARTICIPANTE ${participantPhone} ENCONTRADO NA BLACKLIST - REMOVENDO`)
        console.log(`🚫 Dados da blacklist:`, blacklistEntry)
        
        // Remover do grupo
        await this.removeParticipantFromGroup(group.whatsapp_id, participantPhone, group.group_families.user_id)
        
        // Enviar mensagem de banimento
        await this.sendBanMessage(participantPhone, group.group_families.user_id)
        
        // Criar notificação
        await this.createBanNotification(group, participantPhone)
      } else {
        console.log(`✅ Participante ${participantPhone} não está na blacklist`)
      }

    } catch (error) {
      console.error(`❌ Erro ao verificar blacklist para ${participantPhone}:`, error)
    }
  }

  /**
   * Remove participante do grupo via Z-API
   */
  private async removeParticipantFromGroup(groupId: string, participantPhone: string, userId: string) {
    const maxRetries = 3
    const retryDelay = 1000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚫 Removendo participante do grupo (tentativa ${attempt}/${maxRetries}):`, { groupId, participantPhone })

        // Buscar instância Z-API ativa
        const { data: zApiInstance, error: instanceError } = await this.supabase
          .from('z_api_instances')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .single()

        if (instanceError || !zApiInstance) {
          console.error('❌ Instância Z-API não encontrada para remoção:', instanceError)
          return
        }

        // Fazer requisição para remover participante com timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        try {
          const response = await fetch(
            `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/remove-participant`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Client-Token': zApiInstance.client_token || '',
              },
              body: JSON.stringify({
                groupId: groupId,
                phone: participantPhone
              }),
              signal: controller.signal
            }
          )

          clearTimeout(timeoutId)
          const result = await response.json()
          
          if (response.ok && result.value) {
            console.log('✅ Participante removido com sucesso do grupo:', participantPhone)
            return // Sucesso, sair do loop
          } else {
            console.error('❌ Erro ao remover participante:', result)
            if (attempt === maxRetries) return
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }

      } catch (error) {
        console.error(`❌ Erro ao remover participante do grupo (tentativa ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          console.error('❌ Falha definitiva ao remover participante:', participantPhone)
          return
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
  }

  /**
   * Envia mensagem de banimento
   */
  private async sendBanMessage(participantPhone: string, userId: string) {
    const maxRetries = 3
    const retryDelay = 1000

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📱 Enviando mensagem de banimento para: ${participantPhone} (tentativa ${attempt}/${maxRetries})`)

        // Buscar instância Z-API ativa
        const { data: zApiInstance, error: instanceError } = await this.supabase
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
        const banMessage = `Você está banido dos grupos do WhatsApp. Contate o administrador para mais informações: ${this.config.adminPhone}`

        // Fazer requisição para enviar mensagem com timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        try {
          const response = await fetch(
            `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/send-text`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Client-Token': zApiInstance.client_token || '',
              },
              body: JSON.stringify({
                phone: participantPhone,
                message: banMessage
              }),
              signal: controller.signal
            }
          )

          clearTimeout(timeoutId)
          const result = await response.json()
          
          if (response.ok && result.value) {
            console.log('✅ Mensagem de banimento enviada com sucesso para:', participantPhone)
            return // Sucesso, sair do loop
          } else {
            console.error('❌ Erro ao enviar mensagem de banimento:', result)
            if (attempt === maxRetries) return
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }

      } catch (error) {
        console.error(`❌ Erro ao enviar mensagem de banimento (tentativa ${attempt}/${maxRetries}):`, error)
        
        if (attempt === maxRetries) {
          console.error('❌ Falha definitiva ao enviar mensagem de banimento para:', participantPhone)
          return
        }
        
        // Aguardar antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
      }
    }
  }

  /**
   * Cria notificação de banimento
   */
  private async createBanNotification(group: any, participantPhone: string) {
    try {
      const { error: notificationError } = await this.supabase
        .from('group_notifications')
        .insert({
          group_id: group.id,
          user_id: group.group_families.user_id,
          type: 'member_banned',
          title: 'Participante removido por blacklist',
          message: `O usuário ${participantPhone} foi removido automaticamente do grupo "${group.name}" por estar na blacklist.`,
          data: {
            participant_phone: participantPhone,
            group_whatsapp_id: group.whatsapp_id,
            group_name: group.name,
            timestamp: Date.now(),
            source: 'scheduler_monitor',
            reason: 'blacklist'
          }
        })

      if (notificationError) {
        console.error('❌ Erro ao criar notificação de banimento:', notificationError)
      } else {
        console.log('✅ Notificação de banimento criada para:', participantPhone)
      }

    } catch (error) {
      console.error('❌ Erro ao criar notificação de banimento:', error)
    }
  }

  /**
   * Atualiza lista de participantes no banco
   */
  private async updateGroupParticipants(groupId: string, participants: string[]) {
    try {
      const { error: updateError } = await this.supabase
        .from('whatsapp_groups')
        .update({
          participants: participants,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (updateError) {
        console.error('❌ Erro ao atualizar participantes:', updateError)
      } else {
        console.log('✅ Lista de participantes atualizada no banco')
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar participantes:', error)
    }
  }

  /**
   * Status do monitor
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.config.checkInterval,
      adminPhone: this.config.adminPhone
    }
  }
}
