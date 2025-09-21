import { getUltraRobustMonitor } from './ultra-robust-monitor'

/**
 * Auto-inicializa o sistema ultra-robusto quando o servidor inicia
 * Isso garante que o monitor NUNCA pare sozinho
 */
export function autoStartUltraRobust() {
  try {
    console.log('🚀 Auto-inicializando sistema ULTRA-ROBUSTO...')
    
    const ultraRobust = getUltraRobustMonitor()
    
    // Verificar se já está rodando
    if (ultraRobust.getStatus().isRunning) {
      console.log('✅ Sistema ultra-robusto já está rodando')
      return
    }
    
    // Iniciar sistema ultra-robusto
    ultraRobust.start()
    
    console.log('✅ Sistema ULTRA-ROBUSTO auto-inicializado com sucesso!')
    console.log('🛡️ Monitor protegido contra TODAS as falhas - NUNCA para sozinho!')
    
  } catch (error) {
    console.error('❌ Erro ao auto-inicializar sistema ultra-robusto:', error)
  }
}

/**
 * Verifica se o sistema ultra-robusto está rodando e inicia se necessário
 */
export function ensureUltraRobustRunning() {
  try {
    const ultraRobust = getUltraRobustMonitor()
    const status = ultraRobust.getStatus()
    
    if (!status.isRunning) {
      console.log('🔄 Sistema ultra-robusto não está rodando - iniciando...')
      ultraRobust.start()
    }
    
    return status.isRunning
    
  } catch (error) {
    console.error('❌ Erro ao verificar sistema ultra-robusto:', error)
    return false
  }
}
