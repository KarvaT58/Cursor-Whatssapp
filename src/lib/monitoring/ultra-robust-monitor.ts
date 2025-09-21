import { GroupMonitor } from './group-monitor'
import { getHeartbeatSystem } from './heartbeat-system'
import { createClient } from '@supabase/supabase-js'

interface UltraRobustConfig {
  checkInterval: number
  maxRestartAttempts: number
  restartDelay: number
  healthCheckTimeout: number
  forceRestartInterval: number // Força restart a cada X tempo
}

export class UltraRobustMonitor {
  private groupMonitor: GroupMonitor | null = null
  private config: UltraRobustConfig
  private intervalId: NodeJS.Timeout | null = null
  private forceRestartId: NodeJS.Timeout | null = null
  private isRunning = false
  private restartAttempts = 0
  private lastHealthCheck = 0
  private lastForceRestart = 0
  private supabase: any
  private heartbeat: any

  constructor(config: UltraRobustConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.heartbeat = getHeartbeatSystem()
    
    // Configurar handlers para cleanup
    this.setupCleanupHandlers()
  }

  private setupCleanupHandlers() {
    const cleanup = () => {
      console.log('🧹 UltraRobust: Limpando antes de encerrar processo...')
      this.stop()
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)
  }

  /**
   * Inicia o sistema ultra-robusto - NUNCA para sozinho!
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ UltraRobust já está rodando')
      return
    }

    console.log('🛡️ Iniciando sistema ULTRA-ROBUSTO - Monitor NUNCA para sozinho!')
    this.isRunning = true
    this.lastHealthCheck = Date.now()
    this.lastForceRestart = Date.now()

    // Iniciar heartbeat
    this.heartbeat.start()

    // Verificar e iniciar monitor imediatamente
    this.ensureMonitorRunning()

    // Verificação contínua a cada 5 segundos
    this.intervalId = setInterval(() => {
      this.ultraHealthCheck()
    }, this.config.checkInterval)

    // Força restart a cada 30 minutos para garantir que nunca trave
    this.forceRestartId = setInterval(() => {
      this.forceRestart()
    }, this.config.forceRestartInterval)

    // Salvar estado
    this.saveUltraRobustState()

    console.log('🛡️ Sistema ULTRA-ROBUSTO iniciado - Monitor protegido contra TODAS as falhas!')
  }

  /**
   * Para o sistema (apenas por comando manual)
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.forceRestartId) {
      clearInterval(this.forceRestartId)
      this.forceRestartId = null
    }

    if (this.groupMonitor) {
      this.groupMonitor.stop()
      this.groupMonitor = null
    }

    this.heartbeat.stop()
    this.isRunning = false
    this.restartAttempts = 0
    console.log('⏹️ UltraRobust parado (apenas por comando manual)')
    
    this.saveUltraRobustState()
  }

  /**
   * Verificação de saúde ultra-robusta
   */
  private async ultraHealthCheck() {
    try {
      const now = Date.now()
      this.lastHealthCheck = now

      // 1. Verificar se o monitor existe e está rodando
      if (!this.groupMonitor || !this.groupMonitor.getStatus().isRunning) {
        console.log('🚨 UltraRobust: Monitor não está rodando - INICIANDO IMEDIATAMENTE!')
        await this.ensureMonitorRunning()
        return
      }

      // 2. Verificar se o monitor está saudável
      const status = this.groupMonitor.getStatus()
      if (!status.isHealthy) {
        console.log('🚨 UltraRobust: Monitor não está saudável - REINICIANDO!')
        await this.restartMonitor()
        return
      }

      // 3. Verificar se o monitor não está "travado"
      const timeSinceLastCheck = status.timeSinceLastCheck || 0
      if (timeSinceLastCheck > this.config.healthCheckTimeout) {
        console.log(`🚨 UltraRobust: Monitor travado (${timeSinceLastCheck}ms) - REINICIANDO!`)
        await this.restartMonitor()
        return
      }

      // 4. Verificar heartbeat
      if (!this.heartbeat.isAlive()) {
        console.log('🚨 UltraRobust: Heartbeat morto - REINICIANDO TUDO!')
        await this.fullRestart()
        return
      }

      // 5. Verificar se o processo está "vivo" (não travado)
      const timeSinceLastHealthCheck = now - this.lastHealthCheck
      if (timeSinceLastHealthCheck > 10000) { // 10 segundos
        console.log('🚨 UltraRobust: Processo travado - REINICIANDO!')
        await this.fullRestart()
        return
      }

      // Tudo está funcionando
      console.log(`✅ UltraRobust: Sistema saudável (última verificação: ${Math.round(timeSinceLastCheck / 1000)}s atrás)`)
      this.restartAttempts = 0

    } catch (error) {
      console.error('❌ UltraRobust: Erro no health check:', error)
      await this.fullRestart()
    }
  }

  /**
   * Força restart periódico para evitar travamentos
   */
  private async forceRestart() {
    try {
      const now = Date.now()
      this.lastForceRestart = now

      console.log('🔄 UltraRobust: Restart forçado periódico para evitar travamentos...')
      await this.restartMonitor()

    } catch (error) {
      console.error('❌ UltraRobust: Erro no restart forçado:', error)
    }
  }

  /**
   * Garante que o monitor está rodando
   */
  private async ensureMonitorRunning() {
    try {
      // Se já existe um monitor rodando, não fazer nada
      if (this.groupMonitor && this.groupMonitor.getStatus().isRunning) {
        console.log('✅ UltraRobust: Monitor já está rodando')
        return
      }

      // Parar monitor existente se houver
      if (this.groupMonitor) {
        this.groupMonitor.stop()
      }

      // Buscar configurações
      const config = await this.getMonitorConfig()
      
      // Criar novo monitor
      this.groupMonitor = new GroupMonitor(config)
      
      // Iniciar monitor
      this.groupMonitor.start()
      
      console.log('🚀 UltraRobust: Monitor iniciado com sucesso!')
      this.restartAttempts = 0

    } catch (error) {
      console.error('❌ UltraRobust: Erro ao iniciar monitor:', error)
      this.restartAttempts++
      
      if (this.restartAttempts < this.config.maxRestartAttempts) {
        console.log(`🔄 UltraRobust: Tentativa ${this.restartAttempts}/${this.config.maxRestartAttempts} - Tentando novamente em ${this.config.restartDelay}ms`)
        setTimeout(() => this.ensureMonitorRunning(), this.config.restartDelay)
      } else {
        console.error('❌ UltraRobust: Máximo de tentativas atingido - Tentando restart completo...')
        await this.fullRestart()
      }
    }
  }

  /**
   * Reinicia o monitor
   */
  private async restartMonitor() {
    try {
      console.log('🔄 UltraRobust: Reiniciando monitor...')
      
      if (this.groupMonitor) {
        this.groupMonitor.stop()
        this.groupMonitor = null
      }

      // Aguardar um pouco antes de reiniciar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await this.ensureMonitorRunning()
      
    } catch (error) {
      console.error('❌ UltraRobust: Erro ao reiniciar monitor:', error)
      await this.fullRestart()
    }
  }

  /**
   * Restart completo do sistema
   */
  private async fullRestart() {
    try {
      console.log('🔄 UltraRobust: Restart completo do sistema...')
      
      // Parar tudo
      this.stop()
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Reiniciar tudo
      this.start()
      
    } catch (error) {
      console.error('❌ UltraRobust: Erro no restart completo:', error)
    }
  }

  /**
   * Obtém configurações do monitor
   */
  private async getMonitorConfig() {
    try {
      const { data: monitorState, error } = await this.supabase
        .from('monitor_state')
        .select('*')
        .eq('id', 'group_monitor')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar configurações do monitor:', error)
      }

      if (monitorState) {
        return {
          checkInterval: monitorState.check_interval || 30000,
          adminPhone: monitorState.admin_phone || '(45) 91284-3589'
        }
      }

      return {
        checkInterval: 30000,
        adminPhone: '(45) 91284-3589'
      }

    } catch (error) {
      console.error('❌ Erro ao obter configurações do monitor:', error)
      return {
        checkInterval: 30000,
        adminPhone: '(45) 91284-3589'
      }
    }
  }

  /**
   * Salva estado do sistema ultra-robusto
   */
  private async saveUltraRobustState() {
    try {
      const state = {
        is_running: this.isRunning,
        restart_attempts: this.restartAttempts,
        last_health_check: new Date(this.lastHealthCheck).toISOString(),
        last_force_restart: new Date(this.lastForceRestart).toISOString(),
        check_interval: this.config.checkInterval,
        max_restart_attempts: this.config.maxRestartAttempts,
        health_check_timeout: this.config.healthCheckTimeout,
        force_restart_interval: this.config.forceRestartInterval,
        updated_at: new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('monitor_state')
        .upsert({
          id: 'ultra_robust_monitor',
          ...state
        })

      if (error) {
        console.error('❌ Erro ao salvar estado do UltraRobust:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar estado do UltraRobust:', error)
    }
  }

  /**
   * Obtém status do sistema ultra-robusto
   */
  getStatus() {
    const monitorStatus = this.groupMonitor ? this.groupMonitor.getStatus() : null
    const heartbeatStatus = this.heartbeat.getStatus()
    
    return {
      isRunning: this.isRunning,
      restartAttempts: this.restartAttempts,
      lastHealthCheck: this.lastHealthCheck,
      lastForceRestart: this.lastForceRestart,
      monitorStatus: monitorStatus,
      heartbeatStatus: heartbeatStatus,
      config: this.config,
      isHealthy: this.isRunning && monitorStatus?.isRunning === true && heartbeatStatus.isAlive
    }
  }

  /**
   * Força reinicialização completa
   */
  async forceFullRestart() {
    console.log('🔄 UltraRobust: Reinicialização completa forçada solicitada')
    await this.fullRestart()
  }
}

// Instância singleton do sistema ultra-robusto
let ultraRobustMonitor: UltraRobustMonitor | null = null

export function getUltraRobustMonitor(): UltraRobustMonitor {
  if (!ultraRobustMonitor) {
    ultraRobustMonitor = new UltraRobustMonitor({
      checkInterval: 5000, // Verificar a cada 5 segundos
      maxRestartAttempts: 20, // Máximo 20 tentativas
      restartDelay: 3000, // 3 segundos entre tentativas
      healthCheckTimeout: 30000, // 30 segundos sem verificação = travado
      forceRestartInterval: 30 * 60 * 1000 // 30 minutos
    })
  }
  return ultraRobustMonitor
}
