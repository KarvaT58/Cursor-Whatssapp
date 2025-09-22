-- Criar tabela de campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT,
  recipients TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  stats JSONB DEFAULT '{"total": 0, "sent": 0, "delivered": 0, "read": 0, "failed": 0}',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mensagens variáveis das campanhas
CREATE TABLE IF NOT EXISTS campaign_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  message_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de mídias das campanhas
CREATE TABLE IF NOT EXISTS campaign_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  message_id UUID REFERENCES campaign_messages(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  media_url TEXT NOT NULL,
  media_name TEXT NOT NULL,
  media_size INTEGER,
  media_mime_type TEXT,
  media_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de agendamentos das campanhas
CREATE TABLE IF NOT EXISTS campaign_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  days_of_week TEXT DEFAULT '1,2,3,4,5,6,7',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de logs de envio das campanhas
CREATE TABLE IF NOT EXISTS campaign_send_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  group_id UUID REFERENCES whatsapp_groups(id) ON DELETE CASCADE,
  message_id UUID REFERENCES campaign_messages(id) ON DELETE CASCADE,
  media_id UUID REFERENCES campaign_media(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  message_id_whatsapp TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign_id ON campaign_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_order ON campaign_messages(message_order);
CREATE INDEX IF NOT EXISTS idx_campaign_media_campaign_id ON campaign_media(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_media_message_id ON campaign_media(message_id);
CREATE INDEX IF NOT EXISTS idx_campaign_media_order ON campaign_media(media_order);
CREATE INDEX IF NOT EXISTS idx_campaign_schedules_campaign_id ON campaign_schedules(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_send_logs_campaign_id ON campaign_send_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_send_logs_group_id ON campaign_send_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_campaign_send_logs_status ON campaign_send_logs(status);

-- Criar triggers para updated_at
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_messages_updated_at 
  BEFORE UPDATE ON campaign_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_media_updated_at 
  BEFORE UPDATE ON campaign_media 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_schedules_updated_at 
  BEFORE UPDATE ON campaign_schedules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_send_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para campaigns
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Criar políticas RLS para campaign_messages
CREATE POLICY "Users can view campaign messages of their campaigns" ON campaign_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign messages to their campaigns" ON campaign_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign messages of their campaigns" ON campaign_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete campaign messages of their campaigns" ON campaign_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Criar políticas RLS para campaign_media
CREATE POLICY "Users can view campaign media of their campaigns" ON campaign_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_media.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign media to their campaigns" ON campaign_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_media.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign media of their campaigns" ON campaign_media
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_media.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete campaign media of their campaigns" ON campaign_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_media.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Criar políticas RLS para campaign_schedules
CREATE POLICY "Users can view campaign schedules of their campaigns" ON campaign_schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_schedules.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign schedules to their campaigns" ON campaign_schedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_schedules.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign schedules of their campaigns" ON campaign_schedules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_schedules.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete campaign schedules of their campaigns" ON campaign_schedules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_schedules.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Criar políticas RLS para campaign_send_logs
CREATE POLICY "Users can view campaign send logs of their campaigns" ON campaign_send_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_send_logs.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert campaign send logs to their campaigns" ON campaign_send_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_send_logs.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update campaign send logs of their campaigns" ON campaign_send_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_send_logs.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete campaign send logs of their campaigns" ON campaign_send_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_send_logs.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );
