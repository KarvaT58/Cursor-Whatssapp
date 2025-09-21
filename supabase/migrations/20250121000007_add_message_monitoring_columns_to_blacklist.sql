-- Adicionar colunas para monitoramento de mensagens na tabela blacklist
ALTER TABLE public.blacklist
ADD COLUMN IF NOT EXISTS reason TEXT,
ADD COLUMN IF NOT EXISTS auto_added BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_message TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentários para as novas colunas
COMMENT ON COLUMN public.blacklist.reason IS 'Motivo do banimento (spam, offensive, payment_link, blacklist)';
COMMENT ON COLUMN public.blacklist.auto_added IS 'Se foi adicionado automaticamente pelo sistema de monitoramento';
COMMENT ON COLUMN public.blacklist.original_message IS 'Mensagem original que causou o banimento';
COMMENT ON COLUMN public.blacklist.banned_at IS 'Data e hora do banimento';

-- Índice para melhorar performance nas consultas por motivo
CREATE INDEX IF NOT EXISTS idx_blacklist_reason ON public.blacklist(reason);
CREATE INDEX IF NOT EXISTS idx_blacklist_auto_added ON public.blacklist(auto_added);
CREATE INDEX IF NOT EXISTS idx_blacklist_banned_at ON public.blacklist(banned_at);
