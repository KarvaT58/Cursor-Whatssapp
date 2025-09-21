import { createClient } from '@supabase/supabase-js'

interface HeartbeatConfig {
  interval: number // Intervalo do heartbeat em ms
  timeout: number // Timeout para considerar morto
  maxMissedBeats: number // Máximo de heartbeats perdidos
}

export class HeartbeatSystem {
  private supabase: any
  private config: HeartbeatConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private lastHeartbeat = 0
  private missedBeats = 0

  constructor(config: HeartbeatConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Inicia o sistema de heartbeat
   */
  start() {
    if (this.isRunning) {
      console.log('💓 Heartbeat já está rodando')
      return
    }

    console.log('💓 Iniciando sistema de heartbeat ultra-robusto...')
    this.isRunning = true
    this.lastHeartbeat = Date.now()
    this.missedBeats = 0

    // Enviar heartbeat a cada 5 segundos
    this.intervalId = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.interval)

    // Enviar heartbeat imediatamente
    this.sendHeartbeat()

    console.log('💓 Heartbeat iniciado - Monitor será mantido vivo SEMPRE!')
  }

  /**
   * Para o sistema de heartbeat
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('💓 Heartbeat parado')
  }

  /**
   * Envia heartbeat para o banco
   */
  private async sendHeartbeat() {
    try {
      const now = Date.now()
      this.lastHeartbeat = now

      // Salvar heartbeat no banco
      await this.supabase
        .from('monitor_state')
        .upsert({
          id: 'monitor_heartbeat',
          is_running: true,
          last_check_time: new Date(now).toISOString(),
          updated_at: new Date(now).toISOString(),
          heartbeat_data: {
            timestamp: now,
            missed_beats: this.missedBeats,
            status: 'alive'
          }
        })

      // Reset contador de heartbeats perdidos
      this.missedBeats = 0

      console.log(`💓 Heartbeat enviado - ${new Date(now).toLocaleTimeString()}`)

    } catch (error) {
      this.missedBeats++
      console.error(`❌ Erro ao enviar heartbeat (${this.missedBeats}/${this.config.maxMissedBeats}):`, error)
      
      if (this.missedBeats >= this.config.maxMissedBeats) {
        console.error('💀 Muitos heartbeats perdidos - Sistema pode estar morto!')
      }
    }
  }

  /**
   * Verifica se o sistema está vivo
   */
  isAlive(): boolean {
    const now = Date.now()
    const timeSinceLastHeartbeat = now - this.lastHeartbeat
    return timeSinceLastHeartbeat < this.config.timeout
  }

  /**
   * Obtém status do heartbeat
   */
  getStatus() {
    const now = Date.now()
    const timeSinceLastHeartbeat = now - this.lastHeartbeat
    
    return {
      isRunning: this.isRunning,
      lastHeartbeat: this.lastHeartbeat,
      timeSinceLastHeartbeat: timeSinceLastHeartbeat,
      missedBeats: this.missedBeats,
      isAlive: this.isAlive(),
      config: this.config
    }
  }
}

// Instância singleton do heartbeat
let heartbeatSystem: HeartbeatSystem | null = null

export function getHeartbeatSystem(): HeartbeatSystem {
  if (!heartbeatSystem) {
    heartbeatSystem = new HeartbeatSystem({
      interval: 5000, // 5 segundos
      timeout: 15000, // 15 segundos
      maxMissedBeats: 3 // Máximo 3 heartbeats perdidos
    })
  }
  return heartbeatSystem
}
