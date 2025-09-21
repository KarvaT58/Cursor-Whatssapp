-- Adicionar colunas necessárias para o sistema ultra-robusto
ALTER TABLE monitor_state 
ADD COLUMN IF NOT EXISTS force_restart_interval INTEGER DEFAULT 1800000, -- 30 minutos em ms
ADD COLUMN IF NOT EXISTS last_force_restart TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS heartbeat_data JSONB,
ADD COLUMN IF NOT EXISTS ultra_robust_config JSONB;

-- Comentários para documentação
COMMENT ON COLUMN monitor_state.force_restart_interval IS 'Intervalo para restart forçado em ms (padrão: 30 minutos)';
COMMENT ON COLUMN monitor_state.last_force_restart IS 'Último restart forçado do sistema ultra-robusto';
COMMENT ON COLUMN monitor_state.heartbeat_data IS 'Dados do sistema de heartbeat';
COMMENT ON COLUMN monitor_state.ultra_robust_config IS 'Configurações do sistema ultra-robusto';
