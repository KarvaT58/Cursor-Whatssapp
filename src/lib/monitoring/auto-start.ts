import { getMonitorWatchdog } from './monitor-watchdog'

/**
 * Auto-inicializa o watchdog quando o servidor inicia
 * Isso garante que o monitor sempre esteja rodando
 */
export function autoStartWatchdog() {
  try {
    console.log('🚀 Auto-inicializando watchdog do monitor...')
    
    const watchdog = getMonitorWatchdog()
    
    // Verificar se já está rodando
    if (watchdog.getStatus().isRunning) {
      console.log('✅ Watchdog já está rodando')
      return
    }
    
    // Iniciar watchdog
    watchdog.start()
    
    console.log('✅ Watchdog auto-inicializado com sucesso!')
    console.log('🛡️ Monitor protegido contra falhas - NUNCA para sozinho!')
    
  } catch (error) {
    console.error('❌ Erro ao auto-inicializar watchdog:', error)
  }
}

/**
 * Verifica se o watchdog está rodando e inicia se necessário
 */
export function ensureWatchdogRunning() {
  try {
    const watchdog = getMonitorWatchdog()
    const status = watchdog.getStatus()
    
    if (!status.isRunning) {
      console.log('🔄 Watchdog não está rodando - iniciando...')
      watchdog.start()
    }
    
    return status.isRunning
    
  } catch (error) {
    console.error('❌ Erro ao verificar watchdog:', error)
    return false
  }
}
