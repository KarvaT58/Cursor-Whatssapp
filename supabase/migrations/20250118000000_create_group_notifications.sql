CREATE TABLE IF NOT EXISTS group_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES whatsapp_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, -- e.g., 'join_request', 'admin_promotion', 'member_added', 'member_removed', 'group_updated'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data related to the notification (e.g., member_phone, old_settings, new_settings)
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_group_notifications_group_id ON group_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_user_id ON group_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_type ON group_notifications(type);
CREATE INDEX IF NOT EXISTS idx_group_notifications_read ON group_notifications(read);

ALTER TABLE group_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their group notifications" ON group_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their group notifications" ON group_notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their group notifications" ON group_notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their group notifications" ON group_notifications
FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS handle_updated_at BEFORE UPDATE ON group_notifications
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');
