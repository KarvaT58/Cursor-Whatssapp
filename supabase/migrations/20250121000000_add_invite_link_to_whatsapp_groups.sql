-- Adicionar coluna para armazenar o link de convite do grupo
ALTER TABLE whatsapp_groups 
ADD COLUMN invite_link TEXT;

-- Comentário para documentar a coluna
COMMENT ON COLUMN whatsapp_groups.invite_link IS 'Link de convite do grupo no WhatsApp (gerado automaticamente)';

-- Índice para melhorar performance nas consultas por link de convite
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_invite_link ON whatsapp_groups(invite_link) WHERE invite_link IS NOT NULL;
