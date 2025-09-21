-- Adicionar campo admin_phone na tabela users
ALTER TABLE users
ADD COLUMN admin_phone TEXT DEFAULT '(45) 91284-3589';

-- Comentário explicativo
COMMENT ON COLUMN users.admin_phone IS 'Número do administrador para mensagens de banimento';
