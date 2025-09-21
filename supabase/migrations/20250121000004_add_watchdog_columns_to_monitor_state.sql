-- Adicionar colunas necessárias para o watchdog
ALTER TABLE monitor_state 
ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS restart_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_restart_attempts INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS check_interval INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS health_check_timeout INTEGER DEFAULT 60000,
ADD COLUMN IF NOT EXISTS restart_delay INTEGER DEFAULT 5000;

-- Atualizar colunas existentes se necessário
ALTER TABLE monitor_state 
ALTER COLUMN restart_count SET DEFAULT 0,
ALTER COLUMN consecutive_errors SET DEFAULT 0;

-- Comentários para documentação
COMMENT ON COLUMN monitor_state.last_health_check IS 'Última verificação de saúde do watchdog';
COMMENT ON COLUMN monitor_state.restart_attempts IS 'Número de tentativas de reinicialização do watchdog';
COMMENT ON COLUMN monitor_state.max_restart_attempts IS 'Máximo de tentativas de reinicialização';
COMMENT ON COLUMN monitor_state.check_interval IS 'Intervalo de verificação do watchdog em ms';
COMMENT ON COLUMN monitor_state.health_check_timeout IS 'Timeout para health check em ms';
COMMENT ON COLUMN monitor_state.restart_delay IS 'Delay entre tentativas de restart em ms';
