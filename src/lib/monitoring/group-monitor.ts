import { createClient } from '@supabase/supabase-js'
import { blacklistCache } from './blacklist-cache'

export interface GroupMonitorConfig {
  checkInterval: number // em milissegundos (30000 = 30 segundos)
  adminPhone: string // telefone do administrador para mensagens de banimento
}

export class GroupMonitor {
  private supabase: any
  private config: GroupMonitorConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private restartCount = 0
  private maxRestarts = 5
  private lastCheckTime = 0
  private consecutiveErrors = 0
  private maxConsecutiveErrors = 3

  constructor(config: GroupMonitorConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Configurar handlers para cleanup
    this.setupCleanupHandlers()
  }

  /**
   * Configura handlers para cleanup quando o processo termina
   */
  private setupCleanupHandlers() {
    const cleanup = () => {
      console.log('🧹 Limpando monitor antes de encerrar processo...')
      this.stop()
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)
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
    this.lastCheckTime = Date.now()

    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllGroups()
        this.consecutiveErrors = 0 // Reset contador de erros em caso de sucesso
      } catch (error) {
        this.consecutiveErrors++
        console.error(`❌ Erro no monitor de grupos (${this.consecutiveErrors}/${this.maxConsecutiveErrors}):`, error)
        
        // Se muitos erros consecutivos, tentar reiniciar
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
          console.log('🔄 Muitos erros consecutivos, reiniciando monitor...')
          await this.restart()
        }
      }
    }, this.config.checkInterval)

    // Executar verificação imediata
    this.checkAllGroups()
    
    // Salvar estado no banco
    this.saveMonitorState()
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
    
    // Salvar estado parado no banco
    this.saveMonitorState()
  }

  /**
   * Reinicia o monitor
   */
  private async restart() {
    if (this.restartCount >= this.maxRestarts) {
      console.error('❌ Máximo de reinicializações atingido, parando monitor')
      this.stop()
      return
    }

    this.restartCount++
    console.log(`🔄 Reiniciando monitor (tentativa ${this.restartCount}/${this.maxRestarts})`)
    
    this.stop()
    
    // Aguardar um pouco antes de reiniciar
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    this.start()
  }

  /**
   * Salva o estado do monitor no banco de dados
   */
  private async saveMonitorState() {
    try {
      const state = {
        is_running: this.isRunning,
        last_check_time: new Date(this.lastCheckTime).toISOString(),
        restart_count: this.restartCount,
        consecutive_errors: this.consecutiveErrors,
        check_interval: this.config.checkInterval,
        admin_phone: this.config.adminPhone,
        updated_at: new Date().toISOString()
      }

      // Usar upsert para atualizar ou criar
      const { error } = await this.supabase
        .from('monitor_state')
        .upsert({
          id: 'group_monitor',
          ...state
        })

      if (error) {
        console.error('❌ Erro ao salvar estado do monitor:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar estado do monitor:', error)
    }
  }

  /**
   * Verifica todos os grupos ativos
   */
  private async checkAllGroups() {
    try {
      this.lastCheckTime = Date.now()
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

      // Usar participantes salvos no banco (muito mais rápido!)
      const savedParticipants = group.participants || []
      console.log(`📋 Participantes salvos no banco: ${savedParticipants.length}`)
      console.log(`📋 Lista de participantes:`, savedParticipants)

      if (savedParticipants.length === 0) {
        console.log('ℹ️ Nenhum participante encontrado no grupo:', group.name)
        return
      }

      // Verificar cada participante contra a blacklist
      for (const participant of savedParticipants) {
        await this.checkParticipantBlacklist(participant, group)
      }

      console.log(`✅ Verificação de blacklist concluída para ${group.name}`)

    } catch (error) {
      console.error(`❌ Erro ao verificar grupo ${group.name}:`, error)
    }
  }


  /**
   * Normaliza número de telefone para comparação
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return ''
    
    // Remove todos os caracteres não numéricos
    let normalized = phone.replace(/\D/g, '')
    
    // Se começar com 55 (Brasil), remove
    if (normalized.startsWith('55')) {
      normalized = normalized.substring(2)
    }
    
    // Se começar com 0, remove
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1)
    }
    
    return normalized
  }

  /**
   * Verifica se um participante está na blacklist (ULTRA-RÁPIDO)
   */
  private async checkParticipantBlacklist(participantPhone: string, group: any) {
    try {
      const startTime = Date.now()
      console.log(`⚡ Verificação instantânea de blacklist para: ${participantPhone}`)
      console.log(`🔍 User ID do grupo: ${group.group_families.user_id}`)

      // Usar cache ultra-rápido
      const blacklistEntry = await blacklistCache.isBlacklisted(participantPhone, group.group_families.user_id)
      
      const checkTime = Date.now() - startTime
      console.log(`⚡ Verificação concluída em ${checkTime}ms`)

      // Se está na blacklist, remover imediatamente
      if (blacklistEntry) {
        console.log(`🚫 PARTICIPANTE ${participantPhone} ENCONTRADO NA BLACKLIST - REMOVENDO`)
        console.log(`🚫 Dados da blacklist:`, blacklistEntry)
        
        // Remover do grupo e aguardar sucesso
        const removalSuccess = await this.removeParticipantFromGroup(group.whatsapp_id, participantPhone, group.group_families.user_id)
        
        if (removalSuccess) {
          // Aguardar um pouco antes de enviar a mensagem para garantir que a remoção foi processada
          console.log('⏳ Aguardando 2 segundos antes de enviar mensagem de banimento...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Enviar mensagem de banimento
          await this.sendBanMessage(participantPhone, group.group_families.user_id)
          
          // Criar notificação
          await this.createBanNotification(group, participantPhone)
        } else {
          console.log('⚠️ Remoção falhou, não enviando mensagem de banimento')
        }
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
  private async removeParticipantFromGroup(groupId: string, participantPhone: string, userId: string): Promise<boolean> {
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
          return false
        }

        // Fazer requisição para remover participante com timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // Reduzido para 15s

        try {
          const requestBody = {
            communityId: groupId,
            phones: [participantPhone]
          }
          
          console.log('📤 Enviando requisição de remoção:', {
            url: `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/remove-participant`,
            body: requestBody
          })

          const response = await fetch(
            `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/remove-participant`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Client-Token': zApiInstance.client_token || '',
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal
            }
          )

          clearTimeout(timeoutId)
          
          console.log('📥 Resposta da Z-API (remoção):', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          })
          
          const result = await response.json()
          console.log('📥 Resultado da remoção:', result)
          
          if (response.ok && (result.value || result.success || result.removed)) {
            console.log('✅ Participante removido com sucesso do grupo:', participantPhone)
            console.log('🚫 Detalhes da remoção:', result)
            return true // Sucesso, sair do loop
          } else {
            console.error('❌ Erro ao remover participante:', result)
            if (attempt === maxRetries) return false
          }
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }

      } catch (error) {
        const isTimeout = error instanceof Error && error.name === 'AbortError'
        const errorType = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
        
        console.error(`❌ Erro ao remover participante do grupo (tentativa ${attempt}/${maxRetries}) - ${errorType}:`, error.message)
        
        if (attempt === maxRetries) {
          console.error('❌ Falha definitiva ao remover participante:', participantPhone)
          return false
        }
        
        // Aguardar antes da próxima tentativa (mais tempo para timeout)
        const waitTime = isTimeout ? retryDelay * attempt * 2 : retryDelay * attempt
        console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    return false // Se chegou aqui, todas as tentativas falharam
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
        const timeoutId = setTimeout(() => controller.abort(), 30000)

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
          
          if (response.ok && (result.value || result.messageId || result.id)) {
            console.log('✅ Mensagem de banimento enviada com sucesso para:', participantPhone)
            console.log('📱 Detalhes da mensagem:', result)
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
        const isTimeout = error instanceof Error && error.name === 'AbortError'
        const errorType = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR'
        
        console.error(`❌ Erro ao enviar mensagem de banimento (tentativa ${attempt}/${maxRetries}) - ${errorType}:`, error.message)
        
        if (attempt === maxRetries) {
          console.error('❌ Falha definitiva ao enviar mensagem de banimento para:', participantPhone)
          return
        }
        
        // Aguardar antes da próxima tentativa (mais tempo para timeout)
        const waitTime = isTimeout ? retryDelay * attempt * 2 : retryDelay * attempt
        console.log(`⏳ Aguardando ${waitTime}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
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
   * Status do monitor
   */
  getStatus() {
    const now = Date.now()
    const timeSinceLastCheck = now - this.lastCheckTime
    
    return {
      isRunning: this.isRunning,
      checkInterval: this.config.checkInterval,
      adminPhone: this.config.adminPhone,
      restartCount: this.restartCount,
      consecutiveErrors: this.consecutiveErrors,
      lastCheckTime: this.lastCheckTime,
      timeSinceLastCheck: timeSinceLastCheck,
      isHealthy: this.consecutiveErrors < this.maxConsecutiveErrors && timeSinceLastCheck < (this.config.checkInterval * 2),
      uptime: this.isRunning ? now - this.lastCheckTime : 0
    }
  }
}
