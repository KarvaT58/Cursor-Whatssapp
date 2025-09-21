import { GroupMonitor } from './group-monitor'
import { createClient } from '@supabase/supabase-js'

interface WatchdogConfig {
  checkInterval: number // Intervalo para verificar se o monitor está vivo
  maxRestartAttempts: number // Máximo de tentativas de reinicialização
  restartDelay: number // Delay entre tentativas de reinicialização
  healthCheckTimeout: number // Timeout para health check
}

export class MonitorWatchdog {
  private groupMonitor: GroupMonitor | null = null
  private config: WatchdogConfig
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private restartAttempts = 0
  private lastHealthCheck = 0
  private supabase: any

  constructor(config: WatchdogConfig) {
    this.config = config
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Configurar handlers para cleanup
    this.setupCleanupHandlers()
  }

  private setupCleanupHandlers() {
    const cleanup = () => {
      console.log('🧹 Watchdog: Limpando antes de encerrar processo...')
      this.stop()
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)
  }

  /**
   * Inicia o watchdog - ele nunca para sozinho!
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Watchdog já está rodando')
      return
    }

    console.log('🐕 Watchdog iniciado - Monitor será mantido vivo SEMPRE!')
    this.isRunning = true

    // Verificar e iniciar monitor imediatamente
    this.ensureMonitorRunning()

    // Verificar a cada 10 segundos se o monitor está vivo
    this.intervalId = setInterval(() => {
      this.healthCheck()
    }, this.config.checkInterval)

    // Salvar estado do watchdog
    this.saveWatchdogState()
  }

  /**
   * Para o watchdog (apenas quando explicitamente solicitado)
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.groupMonitor) {
      this.groupMonitor.stop()
      this.groupMonitor = null
    }

    this.isRunning = false
    this.restartAttempts = 0
    console.log('⏹️ Watchdog parado (apenas por comando manual)')
    
    // Salvar estado parado
    this.saveWatchdogState()
  }

  /**
   * Verificação de saúde contínua
   */
  private async healthCheck() {
    try {
      const now = Date.now()
      this.lastHealthCheck = now

      // Verificar se o monitor existe e está rodando
      if (!this.groupMonitor || !this.groupMonitor.getStatus().isRunning) {
        console.log('🚨 Watchdog: Monitor não está rodando - INICIANDO IMEDIATAMENTE!')
        await this.ensureMonitorRunning()
        return
      }

      // Verificar se o monitor está saudável
      const status = this.groupMonitor.getStatus()
      if (!status.isHealthy) {
        console.log('🚨 Watchdog: Monitor não está saudável - REINICIANDO!')
        console.log('📊 Status do monitor:', status)
        await this.restartMonitor()
        return
      }

      // Verificar se o monitor não está "travado" (sem verificação há muito tempo)
      const timeSinceLastCheck = status.timeSinceLastCheck || 0
      if (timeSinceLastCheck > this.config.healthCheckTimeout) {
        console.log(`🚨 Watchdog: Monitor travado (${timeSinceLastCheck}ms sem verificação) - REINICIANDO!`)
        await this.restartMonitor()
        return
      }

      // Monitor está saudável
      console.log(`✅ Watchdog: Monitor saudável (última verificação: ${Math.round(timeSinceLastCheck / 1000)}s atrás)`)
      
      // Reset contador de tentativas se tudo está funcionando
      this.restartAttempts = 0

    } catch (error) {
      console.error('❌ Watchdog: Erro no health check:', error)
      await this.restartMonitor()
    }
  }

  /**
   * Garante que o monitor está rodando
   */
  private async ensureMonitorRunning() {
    try {
      // Se já existe um monitor rodando, não fazer nada
      if (this.groupMonitor && this.groupMonitor.getStatus().isRunning) {
        console.log('✅ Watchdog: Monitor já está rodando')
        return
      }

      // Parar monitor existente se houver
      if (this.groupMonitor) {
        this.groupMonitor.stop()
      }

      // Buscar configurações salvas ou usar padrões
      const config = await this.getMonitorConfig()
      
      // Criar novo monitor
      this.groupMonitor = new GroupMonitor(config)
      
      // Iniciar monitor
      this.groupMonitor.start()
      
      console.log('🚀 Watchdog: Monitor iniciado com sucesso!')
      console.log('⚙️ Configurações:', config)
      
      // Reset contador de tentativas
      this.restartAttempts = 0

    } catch (error) {
      console.error('❌ Watchdog: Erro ao iniciar monitor:', error)
      this.restartAttempts++
      
      if (this.restartAttempts < this.config.maxRestartAttempts) {
        console.log(`🔄 Watchdog: Tentativa ${this.restartAttempts}/${this.config.maxRestartAttempts} - Tentando novamente em ${this.config.restartDelay}ms`)
        setTimeout(() => this.ensureMonitorRunning(), this.config.restartDelay)
      } else {
        console.error('❌ Watchdog: Máximo de tentativas atingido - Monitor não pode ser iniciado')
      }
    }
  }

  /**
   * Reinicia o monitor
   */
  private async restartMonitor() {
    try {
      console.log('🔄 Watchdog: Reiniciando monitor...')
      
      if (this.groupMonitor) {
        this.groupMonitor.stop()
        this.groupMonitor = null
      }

      // Aguardar um pouco antes de reiniciar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await this.ensureMonitorRunning()
      
    } catch (error) {
      console.error('❌ Watchdog: Erro ao reiniciar monitor:', error)
    }
  }

  /**
   * Obtém configurações do monitor
   */
  private async getMonitorConfig() {
    try {
      // Buscar configurações salvas no banco
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

      // Usar configurações padrão
      return {
        checkInterval: 30000, // 30 segundos
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
   * Salva estado do watchdog
   */
  private async saveWatchdogState() {
    try {
      const state = {
        is_running: this.isRunning,
        restart_attempts: this.restartAttempts,
        last_health_check: new Date(this.lastHealthCheck).toISOString(),
        check_interval: this.config.checkInterval,
        max_restart_attempts: this.config.maxRestartAttempts,
        updated_at: new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('monitor_state')
        .upsert({
          id: 'monitor_watchdog',
          ...state
        })

      if (error) {
        console.error('❌ Erro ao salvar estado do watchdog:', error)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar estado do watchdog:', error)
    }
  }

  /**
   * Obtém status do watchdog
   */
  getStatus() {
    const monitorStatus = this.groupMonitor ? this.groupMonitor.getStatus() : null
    
    return {
      isRunning: this.isRunning,
      restartAttempts: this.restartAttempts,
      lastHealthCheck: this.lastHealthCheck,
      monitorStatus: monitorStatus,
      config: this.config,
      isHealthy: this.isRunning && monitorStatus?.isRunning === true
    }
  }

  /**
   * Força reinicialização do monitor
   */
  async forceRestart() {
    console.log('🔄 Watchdog: Reinicialização forçada solicitada')
    await this.restartMonitor()
  }
}

// Instância singleton do watchdog
let monitorWatchdog: MonitorWatchdog | null = null

export function getMonitorWatchdog(): MonitorWatchdog {
  if (!monitorWatchdog) {
    monitorWatchdog = new MonitorWatchdog({
      checkInterval: 10000, // Verificar a cada 10 segundos
      maxRestartAttempts: 10, // Máximo 10 tentativas
      restartDelay: 5000, // 5 segundos entre tentativas
      healthCheckTimeout: 60000 // 60 segundos sem verificação = travado
    })
  }
  return monitorWatchdog
}
