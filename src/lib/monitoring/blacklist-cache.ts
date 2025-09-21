import { createClient } from '@supabase/supabase-js'

interface BlacklistEntry {
  id: string
  phone: string
  normalized_phone: string
  user_id: string
  reason?: string
  created_at: string
}

class BlacklistCache {
  private cache: Map<string, BlacklistEntry[]> = new Map()
  private lastUpdate: Map<string, number> = new Map()
  private readonly CACHE_TTL = 30000 // 30 segundos
  private supabase: any

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
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

  /**
   * Verifica se um número está na blacklist (ultra-rápido)
   */
  async isBlacklisted(phone: string, userId: string): Promise<BlacklistEntry | null> {
    const normalizedPhone = this.normalizePhoneNumber(phone)
    
    // Verificar cache primeiro
    const cached = this.getFromCache(userId)
    if (cached) {
      const entry = cached.find(item => item.normalized_phone === normalizedPhone)
      if (entry) {
        console.log(`⚡ CACHE HIT: ${phone} encontrado na blacklist (${entry.phone})`)
        return entry
      }
      console.log(`⚡ CACHE HIT: ${phone} não está na blacklist`)
      return null
    }

    // Cache miss - buscar do banco
    console.log(`🔄 CACHE MISS: Buscando blacklist para user ${userId}`)
    await this.refreshCache(userId)
    
    // Verificar novamente após refresh
    const refreshed = this.getFromCache(userId)
    if (refreshed) {
      const entry = refreshed.find(item => item.normalized_phone === normalizedPhone)
      if (entry) {
        console.log(`⚡ CACHE REFRESH: ${phone} encontrado na blacklist (${entry.phone})`)
        return entry
      }
    }

    console.log(`⚡ CACHE REFRESH: ${phone} não está na blacklist`)
    return null
  }

  /**
   * Obtém blacklist do cache
   */
  private getFromCache(userId: string): BlacklistEntry[] | null {
    const lastUpdate = this.lastUpdate.get(userId)
    if (!lastUpdate) return null

    const now = Date.now()
    if (now - lastUpdate > this.CACHE_TTL) {
      console.log(`⏰ Cache expirado para user ${userId}`)
      return null
    }

    return this.cache.get(userId) || null
  }

  /**
   * Atualiza cache do banco de dados
   */
  private async refreshCache(userId: string): Promise<void> {
    try {
      const { data: blacklist, error } = await this.supabase
        .from('blacklist')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ Erro ao buscar blacklist:', error)
        return
      }

      // Normalizar números e armazenar no cache
      const normalizedBlacklist = (blacklist || []).map(entry => ({
        ...entry,
        normalized_phone: this.normalizePhoneNumber(entry.phone)
      }))

      this.cache.set(userId, normalizedBlacklist)
      this.lastUpdate.set(userId, Date.now())

      console.log(`✅ Cache atualizado para user ${userId}: ${normalizedBlacklist.length} entradas`)
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error)
    }
  }

  /**
   * Invalida cache para um usuário (chamado quando blacklist é modificada)
   */
  invalidateCache(userId: string): void {
    this.cache.delete(userId)
    this.lastUpdate.delete(userId)
    console.log(`🗑️ Cache invalidado para user ${userId}`)
  }

  /**
   * Força atualização do cache
   */
  async forceRefresh(userId: string): Promise<void> {
    this.invalidateCache(userId)
    await this.refreshCache(userId)
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): { [userId: string]: { entries: number, lastUpdate: number, isExpired: boolean } } {
    const stats: { [userId: string]: { entries: number, lastUpdate: number, isExpired: boolean } } = {}
    
    for (const [userId, entries] of this.cache.entries()) {
      const lastUpdate = this.lastUpdate.get(userId) || 0
      const now = Date.now()
      stats[userId] = {
        entries: entries.length,
        lastUpdate,
        isExpired: now - lastUpdate > this.CACHE_TTL
      }
    }
    
    return stats
  }
}

// Instância singleton do cache
export const blacklistCache = new BlacklistCache()
