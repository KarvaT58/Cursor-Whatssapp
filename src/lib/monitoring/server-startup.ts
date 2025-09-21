import { autoStartWatchdog } from './auto-start'

/**
 * Inicializa o sistema de monitoramento quando o servidor inicia
 * Isso garante que o monitor sempre esteja rodando desde o início
 */
export function initializeMonitoringSystem() {
  try {
    console.log('🚀 Inicializando sistema de monitoramento...')
    
    // Auto-inicializar watchdog
    autoStartWatchdog()
    
    console.log('✅ Sistema de monitoramento inicializado!')
    console.log('🛡️ Monitor protegido por watchdog - NUNCA para sozinho!')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de monitoramento:', error)
  }
}

// Auto-inicializar quando o módulo é carregado
if (typeof window === 'undefined') {
  // Só executar no servidor
  initializeMonitoringSystem()
}
