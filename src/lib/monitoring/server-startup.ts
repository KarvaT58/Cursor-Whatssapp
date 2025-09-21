import { autoStartUltraRobust } from './auto-start'

/**
 * Inicializa o sistema de monitoramento ULTRA-ROBUSTO quando o servidor inicia
 * Isso garante que o monitor NUNCA pare sozinho desde o início
 */
export function initializeMonitoringSystem() {
  try {
    console.log('🚀 Inicializando sistema de monitoramento ULTRA-ROBUSTO...')
    
    // Auto-inicializar sistema ultra-robusto
    autoStartUltraRobust()
    
    console.log('✅ Sistema de monitoramento ULTRA-ROBUSTO inicializado!')
    console.log('🛡️ Monitor protegido contra TODAS as falhas - NUNCA para sozinho!')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de monitoramento ultra-robusto:', error)
  }
}

// Auto-inicializar quando o módulo é carregado
if (typeof window === 'undefined') {
  // Só executar no servidor
  initializeMonitoringSystem()
}
