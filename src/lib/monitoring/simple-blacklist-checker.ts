import { createClient } from '@supabase/supabase-js'

/**
 * Sistema SIMPLES de verificação de blacklist
 * Só verifica se o número está na blacklist e remove se estiver
 */
export class SimpleBlacklistChecker {
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Normaliza número de telefone
   */
  private normalizePhone(phone: string): string {
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

  /**
   * Verifica se o número está na blacklist e remove se estiver
   */
  async checkAndRemoveIfBlacklisted(
    participantPhone: string, 
    groupId: string, 
    userId: string
  ): Promise<boolean> {
    try {
      console.log(`🔍 SIMPLES: Verificando ${participantPhone} na blacklist...`)

      // 1. Normalizar número
      const normalizedPhone = this.normalizePhone(participantPhone)
      console.log(`🔍 SIMPLES: Número normalizado: ${normalizedPhone}`)

      // 2. Buscar na blacklist
      const { data: blacklist, error } = await this.supabase
        .from('blacklist')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ SIMPLES: Erro ao buscar blacklist:', error)
        return false
      }

      // 3. Verificar se está na blacklist
      let isBlacklisted = false
      for (const entry of blacklist || []) {
        const normalizedBlacklistPhone = this.normalizePhone(entry.phone)
        if (normalizedPhone === normalizedBlacklistPhone) {
          isBlacklisted = true
          console.log(`🚫 SIMPLES: ${participantPhone} ESTÁ NA BLACKLIST!`)
          break
        }
      }

      if (!isBlacklisted) {
        console.log(`✅ SIMPLES: ${participantPhone} não está na blacklist`)
        return false
      }

      // 4. REMOVER DO GRUPO
      console.log(`🚫 SIMPLES: Removendo ${participantPhone} do grupo ${groupId}`)
      const removed = await this.removeFromGroup(groupId, participantPhone, userId)
      
      if (removed) {
        // 5. ENVIAR MENSAGEM DE BANIMENTO
        console.log(`📱 SIMPLES: Enviando mensagem de banimento para ${participantPhone}`)
        await this.sendBanMessage(participantPhone, userId)
        return true
      }

      return false

    } catch (error) {
      console.error('❌ SIMPLES: Erro na verificação:', error)
      return false
    }
  }

  /**
   * Remove participante do grupo via Z-API
   */
  private async removeFromGroup(groupId: string, participantPhone: string, userId: string): Promise<boolean> {
    try {
      // Buscar instância Z-API
      const { data: zApiInstance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ SIMPLES: Instância Z-API não encontrada:', instanceError)
        return false
      }

      // Fazer requisição para remover
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
            phones: [participantPhone]
          })
        }
      )

      const result = await response.json()
      console.log('📤 SIMPLES: Resposta da remoção:', result)

      if (response.ok && (result.value || result.success || result.removed)) {
        console.log(`✅ SIMPLES: ${participantPhone} removido com sucesso!`)
        return true
      } else {
        console.error('❌ SIMPLES: Erro ao remover:', result)
        return false
      }

    } catch (error) {
      console.error('❌ SIMPLES: Erro na remoção:', error)
      return false
    }
  }

  /**
   * Envia mensagem de banimento
   */
  private async sendBanMessage(participantPhone: string, userId: string): Promise<boolean> {
    try {
      // Buscar instância Z-API
      const { data: zApiInstance, error: instanceError } = await this.supabase
        .from('z_api_instances')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (instanceError || !zApiInstance) {
        console.error('❌ SIMPLES: Instância Z-API não encontrada para mensagem:', instanceError)
        return false
      }

      // Buscar número do administrador do usuário
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('admin_phone')
        .eq('id', userId)
        .single()

      const adminPhone = user?.admin_phone || '(45) 91284-3589'
      console.log('📱 SIMPLES: Usando número do admin:', adminPhone)

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
            message: `Você está banido dos grupos do WhatsApp contate o administrado para mais informações ${adminPhone}`
          })
        }
      )

      const result = await response.json()
      console.log('📱 SIMPLES: Resposta da mensagem:', result)

      if (response.ok && (result.messageId || result.id || result.success)) {
        console.log(`✅ SIMPLES: Mensagem de banimento enviada para ${participantPhone}`)
        return true
      } else {
        console.error('❌ SIMPLES: Erro ao enviar mensagem:', result)
        return false
      }

    } catch (error) {
      console.error('❌ SIMPLES: Erro ao enviar mensagem:', error)
      return false
    }
  }
}

// Instância singleton
export const simpleBlacklistChecker = new SimpleBlacklistChecker()
