-- Adicionar colunas para configurações do grupo
ALTER TABLE whatsapp_groups 
ADD COLUMN admin_only_message BOOLEAN DEFAULT false,
ADD COLUMN admin_only_settings BOOLEAN DEFAULT false,
ADD COLUMN require_admin_approval BOOLEAN DEFAULT false,
ADD COLUMN admin_only_add_member BOOLEAN DEFAULT false;

-- Comentários para documentar as colunas
COMMENT ON COLUMN whatsapp_groups.admin_only_message IS 'Somente administradores podem enviar mensagens no grupo';
COMMENT ON COLUMN whatsapp_groups.admin_only_settings IS 'Somente administradores podem alterar configurações do grupo';
COMMENT ON COLUMN whatsapp_groups.require_admin_approval IS 'Novos membros precisam ser aprovados por um administrador';
COMMENT ON COLUMN whatsapp_groups.admin_only_add_member IS 'Somente administradores podem adicionar novos participantes';
