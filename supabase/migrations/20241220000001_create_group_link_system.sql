-- Criar tabela de famílias de grupos
CREATE TABLE IF NOT EXISTS group_families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  base_name TEXT NOT NULL,
  current_groups TEXT[] DEFAULT '{}',
  max_participants_per_group INTEGER DEFAULT 1024,
  total_participants INTEGER DEFAULT 0,
  system_phone TEXT DEFAULT '554584154115',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de links universais
CREATE TABLE IF NOT EXISTS group_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  universal_link TEXT UNIQUE NOT NULL,
  group_family UUID NOT NULL REFERENCES group_families(id) ON DELETE CASCADE,
  active_groups TEXT[] DEFAULT '{}',
  total_participants INTEGER DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de blacklist
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  reason TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone, user_id)
);

-- Adicionar colunas à tabela whatsapp_groups
ALTER TABLE whatsapp_groups 
ADD COLUMN IF NOT EXISTS universal_link TEXT,
ADD COLUMN IF NOT EXISTS group_family UUID REFERENCES group_families(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_group_families_base_name ON group_families(base_name);
CREATE INDEX IF NOT EXISTS idx_group_families_user_id ON group_families(user_id);
CREATE INDEX IF NOT EXISTS idx_group_links_universal_link ON group_links(universal_link);
CREATE INDEX IF NOT EXISTS idx_group_links_group_family ON group_links(group_family);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON blacklist(phone);
CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_groups_group_family ON whatsapp_groups(group_family);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
CREATE TRIGGER update_group_families_updated_at 
  BEFORE UPDATE ON group_families 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_links_updated_at 
  BEFORE UPDATE ON group_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE group_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para group_families
CREATE POLICY "Users can view their own group families" ON group_families
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own group families" ON group_families
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own group families" ON group_families
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own group families" ON group_families
  FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para group_links
CREATE POLICY "Users can view their own group links" ON group_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own group links" ON group_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own group links" ON group_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own group links" ON group_links
  FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para blacklist
CREATE POLICY "Users can view their own blacklist" ON blacklist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blacklist" ON blacklist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blacklist" ON blacklist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blacklist" ON blacklist
  FOR DELETE USING (auth.uid() = user_id);

-- Política especial para permitir acesso público aos links universais (para entrada de participantes)
CREATE POLICY "Public can view group links for joining" ON group_links
  FOR SELECT USING (true);
