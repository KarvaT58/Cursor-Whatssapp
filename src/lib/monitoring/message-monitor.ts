import { createClient } from '@supabase/supabase-js'

interface MessageData {
  messageId: string
  participantPhone: string
  groupId: string
  message: string
  timestamp: number
  senderName: string
  userId: string
}

interface SpamTracker {
  [key: string]: {
    messages: number
    firstMessageTime: number
    lastMessageTime: number
  }
}

class MessageMonitor {
  private supabase: any
  private spamTracker: SpamTracker = {}
  private readonly SPAM_THRESHOLD = 15 // 15 mensagens
  private readonly SPAM_WINDOW = 60000 // 1 minuto em ms

  // Lista de palavras ofensivas (pode ser expandida)
  private readonly OFFENSIVE_WORDS = [
    // Palavrões básicos
    'merda', 'porra', 'caralho', 'foda', 'puta', 'puto', 'viado', 'bicha',
    'idiota', 'burro', 'retardado', 'imbecil', 'estupido', 'estúpido',
    'filho da puta', 'vai se foder', 'foda-se', 'cacete', 'bosta',
    'palhaço', 'otário', 'otario', 'babaca', 'trouxa', 'idiota',
    
    // Conteúdo sexual
    'sexo', 'transar', 'foder', 'fuder', 'gozar', 'gozada', 'pau', 'pica',
    'buceta', 'bucetão', 'boceta', 'bocetão', 'xoxota', 'xoxotão',
    'peitinho', 'peitão', 'peitos', 'bunda', 'bundão', 'rabo', 'rabao',
    'pornô', 'porno', 'pornografia', 'nude', 'nudes', 'nudismo',
    'masturbar', 'masturbação', 'orgasmo', 'ejaculação', 'sêmen',
    'prostituição', 'prostituta', 'putaria', 'puta', 'puto',
    'safada', 'safado', 'tarada', 'tarado', 'gostosa', 'gostoso',
    'gata', 'gato', 'delícia', 'deliciosa', 'delicioso',
    
    // Conteúdo sexual mais explícito
    'felação', 'boquete', 'chupar', 'chupada', 'mamada', 'mamar',
    'penetrar', 'penetração', 'anal', 'oral', 'vaginal',
    'bdsm', 'sadomasoquismo', 'escravo', 'escrava', 'dominação',
    'fetichismo', 'fetiche', 'voyeurismo', 'exibicionismo',
    
    // Conteúdo sexual em inglês
    'fuck', 'fucking', 'fucked', 'sex', 'sexual', 'porn', 'pornography',
    'dick', 'cock', 'pussy', 'ass', 'asshole', 'bitch', 'whore',
    'slut', 'faggot', 'gay', 'lesbian', 'masturbation', 'orgasm',
    'cum', 'sperm', 'penis', 'vagina', 'breast', 'boobs', 'tits',
    'butt', 'buttocks', 'anus', 'anal', 'oral', 'blowjob', 'handjob'
  ]

  // Padrões de links de pagamento/checkout
  private readonly PAYMENT_PATTERNS = [
    /mercadopago\.com/i,
    /paypal\.com/i,
    /pagseguro\.com/i,
    /picpay\.com/i,
    /nubank\.com/i,
    /inter\.com/i,
    /itau\.com/i,
    /bradesco\.com/i,
    /santander\.com/i,
    /banco do brasil/i,
    /bb\.com/i,
    /checkout/i,
    /pagamento/i,
    /pix/i,
    /transferencia/i,
    /deposito/i,
    /boleto/i,
    /cartao/i,
    /cartão/i,
    /credito/i,
    /crédito/i,
    /debito/i,
    /débito/i
  ]

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Processa uma mensagem recebida e verifica se deve ser banida
   */
  public async processMessage(data: MessageData): Promise<boolean> {
    try {
      console.log('🔍 MESSAGE MONITOR: Processando mensagem:', {
        participantPhone: data.participantPhone,
        message: data.message,
        groupId: data.groupId
      })

      // Verificar se é admin ou dono do grupo (exceções)
      const isAdmin = await this.isAdminOrOwner(data.participantPhone, data.groupId, data.userId)
      if (isAdmin) {
        console.log('✅ MESSAGE MONITOR: Usuário é admin/dono - permitindo mensagem')
        return false // Não banir
      }

      // Verificar spam
      const isSpam = await this.checkSpam(data)
      if (isSpam) {
        console.log('🚫 MESSAGE MONITOR: SPAM detectado!')
        await this.banUser(data, 'spam')
        return true
      }

      // Verificar conteúdo ofensivo
      const isOffensive = this.checkOffensiveContent(data.message)
      if (isOffensive) {
        console.log('🚫 MESSAGE MONITOR: Conteúdo ofensivo detectado!')
        await this.banUser(data, 'offensive')
        return true
      }

      // Verificar links de pagamento
      const hasPaymentLink = this.checkPaymentLinks(data.message)
      if (hasPaymentLink) {
        console.log('🚫 MESSAGE MONITOR: Link de pagamento detectado!')
        await this.banUser(data, 'payment_link')
        return true
      }

      console.log('✅ MESSAGE MONITOR: Mensagem aprovada')
      return false // Não banir

    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao processar mensagem:', error)
      return false
    }
  }

  /**
   * Verifica se o usuário é admin ou dono do grupo
   */
  private async isAdminOrOwner(participantPhone: string, groupId: string, userId: string): Promise<boolean> {
    try {
      // Buscar dados do grupo
      const { data: group, error: groupError } = await this.supabase
        .from('whatsapp_groups')
        .select('*')
        .eq('whatsapp_id', groupId)
        .eq('user_id', userId)
        .single()

      if (groupError || !group) {
        console.error('❌ MESSAGE MONITOR: Grupo não encontrado:', groupId)
        return false
      }

      // Verificar se é o dono do grupo (número da Z-API)
      const { data: zApiInstance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('connected_phone')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (!instanceError && zApiInstance) {
        const ownerPhone = this.normalizePhoneNumber(zApiInstance.connected_phone)
        const participantNormalized = this.normalizePhoneNumber(participantPhone)
        
        if (ownerPhone === participantNormalized) {
          console.log('✅ MESSAGE MONITOR: Usuário é o dono do grupo')
          return true
        }
      }

      // Verificar se é admin do grupo (se tivermos essa informação)
      // Por enquanto, vamos considerar que apenas o dono tem exceção
      return false

    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao verificar admin:', error)
      return false
    }
  }

  /**
   * Verifica se a mensagem é spam (15+ mensagens em 1 minuto)
   */
  private async checkSpam(data: MessageData): Promise<boolean> {
    const key = `${data.participantPhone}_${data.groupId}`
    const now = Date.now()

    // Inicializar tracker se não existir
    if (!this.spamTracker[key]) {
      this.spamTracker[key] = {
        messages: 1,
        firstMessageTime: now,
        lastMessageTime: now
      }
      return false
    }

    const tracker = this.spamTracker[key]

    // Se passou mais de 1 minuto, resetar contador
    if (now - tracker.firstMessageTime > this.SPAM_WINDOW) {
      tracker.messages = 1
      tracker.firstMessageTime = now
      tracker.lastMessageTime = now
      return false
    }

    // Incrementar contador
    tracker.messages++
    tracker.lastMessageTime = now

    console.log(`📊 MESSAGE MONITOR: Spam tracker - ${tracker.messages}/${this.SPAM_THRESHOLD} mensagens`)

    // Verificar se atingiu o limite
    if (tracker.messages >= this.SPAM_THRESHOLD) {
      console.log(`🚫 MESSAGE MONITOR: SPAM! ${tracker.messages} mensagens em ${(now - tracker.firstMessageTime) / 1000}s`)
      return true
    }

    return false
  }

  /**
   * Verifica se a mensagem contém conteúdo ofensivo
   */
  private checkOffensiveContent(message: string): boolean {
    const lowerMessage = message.toLowerCase()
    
    for (const word of this.OFFENSIVE_WORDS) {
      if (lowerMessage.includes(word.toLowerCase())) {
        console.log(`🚫 MESSAGE MONITOR: Palavra ofensiva detectada: "${word}"`)
        return true
      }
    }

    return false
  }

  /**
   * Verifica se a mensagem contém links de pagamento
   */
  private checkPaymentLinks(message: string): boolean {
    for (const pattern of this.PAYMENT_PATTERNS) {
      if (pattern.test(message)) {
        console.log(`🚫 MESSAGE MONITOR: Link de pagamento detectado: ${pattern}`)
        return true
      }
    }

    return false
  }

  /**
   * Bane o usuário e adiciona à blacklist
   */
  private async banUser(data: MessageData, reason: string): Promise<void> {
    try {
      console.log(`🚫 MESSAGE MONITOR: Banindo usuário por ${reason}:`, data.participantPhone)

      // 1. Remover do grupo
      console.log('🔍 MESSAGE MONITOR: Passo 1 - Removendo do grupo...')
      const removed = await this.removeParticipantFromGroup(data.groupId, data.participantPhone, data.userId)
      if (!removed) {
        console.error('❌ MESSAGE MONITOR: Falha ao remover participante do grupo')
        return
      }
      console.log('✅ MESSAGE MONITOR: Passo 1 - Removido do grupo com sucesso')

      // 2. Adicionar à blacklist
      console.log('🔍 MESSAGE MONITOR: Passo 2 - Adicionando à blacklist...')
      await this.addToBlacklist(data.participantPhone, data.userId, reason)
      console.log('✅ MESSAGE MONITOR: Passo 2 - Adicionado à blacklist')

      // 3. Aguardar 2 segundos
      console.log('🔍 MESSAGE MONITOR: Passo 3 - Aguardando 2 segundos...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 4. Enviar mensagem de banimento
      console.log('🔍 MESSAGE MONITOR: Passo 4 - Enviando mensagem de banimento...')
      await this.sendBanMessage(data.participantPhone, data.userId, reason)
      console.log('✅ MESSAGE MONITOR: Passo 4 - Mensagem de banimento enviada')

      // 5. Criar notificação
      console.log('🔍 MESSAGE MONITOR: Passo 5 - Criando notificação...')
      await this.createBanNotification(data, reason)
      console.log('✅ MESSAGE MONITOR: Passo 5 - Notificação criada')

      console.log(`✅ MESSAGE MONITOR: Usuário banido com sucesso por ${reason}`)

    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao banir usuário:', error)
    }
  }

  /**
   * Remove participante do grupo via Z-API
   */
  private async removeParticipantFromGroup(groupId: string, participantPhone: string, userId: string): Promise<boolean> {
    try {
      // Buscar instância Z-API
      const { data: zApiInstance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ MESSAGE MONITOR: Instância Z-API não encontrada:', instanceError)
        return false
      }

      console.log(`🚫 MESSAGE MONITOR: Removendo ${participantPhone} do grupo ${groupId}`)

      const response = await fetch(
        `https://api.z-api.io/instances/${zApiInstance.instance_id}/token/${zApiInstance.instance_token}/remove-participant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Client-Token': zApiInstance.client_token || '',
          },
          body: JSON.stringify({
            communityId: groupId,
            phones: [participantPhone],
          }),
        }
      )

      const result = await response.json()
      console.log('🚫 MESSAGE MONITOR: Resposta da remoção:', result)

      if (response.ok && (result.messageId || result.id || result.success || result.value === true)) {
        console.log(`✅ MESSAGE MONITOR: ${participantPhone} removido com sucesso!`)
        return true
      } else {
        console.error('❌ MESSAGE MONITOR: Erro ao remover participante:', result)
        return false
      }
    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro na remoção:', error)
      return false
    }
  }

  /**
   * Adiciona usuário à blacklist
   */
  private async addToBlacklist(phone: string, userId: string, reason: string): Promise<void> {
    try {
      console.log(`🔍 MESSAGE MONITOR: Tentando adicionar à blacklist:`, {
        phone: phone,
        userId: userId,
        reason: reason
      })

      // Verificar se já está na blacklist
      const { data: existing, error: checkError } = await this.supabase
        .from('blacklist')
        .select('id')
        .eq('user_id', userId)
        .eq('phone', phone)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ MESSAGE MONITOR: Erro ao verificar blacklist:', checkError)
      }

      if (existing) {
        console.log('ℹ️ MESSAGE MONITOR: Usuário já está na blacklist')
        return
      }

      console.log('📝 MESSAGE MONITOR: Inserindo na blacklist...')

      // Adicionar à blacklist
      const { data: insertedData, error: insertError } = await this.supabase
        .from('blacklist')
        .insert({
          phone: phone,
          user_id: userId,
          reason: reason,
          auto_added: true,
          original_message: '', // Será preenchido pela função createBanNotification
          banned_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ MESSAGE MONITOR: Erro ao adicionar à blacklist:', insertError)
        console.error('❌ MESSAGE MONITOR: Detalhes do erro:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
      } else {
        console.log(`✅ MESSAGE MONITOR: ${phone} adicionado à blacklist por ${reason}`)
        console.log('✅ MESSAGE MONITOR: Dados inseridos:', insertedData)
      }
    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao adicionar à blacklist:', error)
    }
  }

  /**
   * Envia mensagem de banimento
   */
  private async sendBanMessage(participantPhone: string, userId: string, reason: string): Promise<boolean> {
    try {
      // Buscar instância Z-API
      const { data: zApiInstance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ MESSAGE MONITOR: Instância Z-API não encontrada para mensagem:', instanceError)
        return false
      }

      // Buscar número do administrador
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('admin_phone')
        .eq('id', userId)
        .single()

      const adminPhone = user?.admin_phone || '(45) 91284-3589'

      // Criar mensagem baseada no motivo
      let banMessage = ''
      switch (reason) {
        case 'spam':
          banMessage = `Você foi removido por enviar muitas mensagens (spam). Contate o administrador para mais informações: ${adminPhone}`
          break
        case 'offensive':
          banMessage = `Você foi removido por enviar conteúdo ofensivo. Contate o administrador para mais informações: ${adminPhone}`
          break
        case 'payment_link':
          banMessage = `Você foi removido por enviar links de pagamento não autorizados. Contate o administrador para mais informações: ${adminPhone}`
          break
        default:
          banMessage = `Você foi removido por violar as regras do grupo. Contate o administrador para mais informações: ${adminPhone}`
      }

      // Enviar mensagem
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
          })
        }
      )

      const result = await response.json()
      console.log('📱 MESSAGE MONITOR: Resposta da mensagem:', result)

      if (response.ok && (result.messageId || result.id || result.success)) {
        console.log(`✅ MESSAGE MONITOR: Mensagem de banimento enviada para ${participantPhone}`)
        return true
      } else {
        console.error('❌ MESSAGE MONITOR: Erro ao enviar mensagem de banimento:', result)
        return false
      }
    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao enviar mensagem de banimento:', error)
      return false
    }
  }

  /**
   * Cria notificação de banimento
   */
  private async createBanNotification(data: MessageData, reason: string): Promise<void> {
    try {
      // Buscar dados do grupo
      const { data: group, error: groupError } = await this.supabase
        .from('whatsapp_groups')
        .select('id, name')
        .eq('whatsapp_id', data.groupId)
        .eq('user_id', data.userId)
        .single()

      if (groupError || !group) {
        console.error('❌ MESSAGE MONITOR: Grupo não encontrado para notificação:', data.groupId)
        return
      }

      let title = ''
      let message = ''
      
      switch (reason) {
        case 'spam':
          title = 'Usuário removido por spam'
          message = `O usuário ${data.participantPhone} foi removido automaticamente do grupo "${group.name}" por enviar muitas mensagens (spam).`
          break
        case 'offensive':
          title = 'Usuário removido por conteúdo ofensivo'
          message = `O usuário ${data.participantPhone} foi removido automaticamente do grupo "${group.name}" por enviar conteúdo ofensivo.`
          break
        case 'payment_link':
          title = 'Usuário removido por link de pagamento'
          message = `O usuário ${data.participantPhone} foi removido automaticamente do grupo "${group.name}" por enviar links de pagamento não autorizados.`
          break
        default:
          title = 'Usuário removido por violação de regras'
          message = `O usuário ${data.participantPhone} foi removido automaticamente do grupo "${group.name}" por violar as regras.`
      }

      const { error: notificationError } = await this.supabase
        .from('group_notifications')
        .insert({
          group_id: group.id,
          user_id: data.userId,
          type: 'member_banned',
          title: title,
          message: message,
          data: {
            participant_phone: data.participantPhone,
            group_whatsapp_id: data.groupId,
            group_name: group.name,
            timestamp: data.timestamp,
            source: 'message_monitor',
            reason: reason,
            original_message: data.message
          }
        })

      // Atualizar a blacklist com a mensagem original
      if (!notificationError) {
        await this.supabase
          .from('blacklist')
          .update({ original_message: data.message })
          .eq('user_id', data.userId)
          .eq('phone', data.participantPhone)
          .eq('reason', reason)
          .eq('auto_added', true)
      }

      if (notificationError) {
        console.error('❌ MESSAGE MONITOR: Erro ao criar notificação:', notificationError)
      } else {
        console.log('✅ MESSAGE MONITOR: Notificação de banimento criada')
      }
    } catch (error) {
      console.error('❌ MESSAGE MONITOR: Erro ao criar notificação:', error)
    }
  }

  /**
   * Normaliza número de telefone para comparação
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return ''
    let normalized = phone.replace(/\D/g, '')
    if (normalized.startsWith('55')) {
      normalized = normalized.substring(2)
    }
    if (normalized.startsWith('0')) {
      normalized = normalized.substring(1)
    }
    return normalized
  }
}

export const messageMonitor = new MessageMonitor()
